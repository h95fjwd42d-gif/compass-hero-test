from playwright.sync_api import sync_playwright
from pathlib import Path
import os,re
os.chdir(Path(__file__).parent)
html=Path('index.html').read_text()
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+Path(m[1]).read_text().replace('</script','<\\/script')+'</script>',html)
html=html.replace('<head>','<head><script>window.__testStorage=window.__testStorage||new Map();Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__testStorage.get(k)||null,setItem:(k,v)=>window.__testStorage.set(k,String(v)),removeItem:k=>window.__testStorage.delete(k)}});</script>')
html=re.sub(r'<link[^>]*href="style.css"[^>]*>',lambda m:'<style>'+Path('style.css').read_text()+'</style>',html)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(html,wait_until='domcontentloaded');page.locator('#start-practical').click(timeout=5000)
 page.locator('[data-practical-answer=yes]').click();page.set_content(html,wait_until='domcontentloaded');page.locator('#continue-practical').click();assert page.locator('#practical-number').inner_text()=='02';page.locator('#practical-back').click();assert page.locator('#practical-number').inner_text()=='01'
 for i in range(30):
  assert page.locator('#practical-number').inner_text()==str(i+1).zfill(2);page.locator('[data-practical-answer=yes]').click()
 assert page.locator('#practical-result').is_visible();assert page.locator('.practical-rank-card').count()==5
 before=page.locator('.practical-rank-card').all_text_contents();assert page.locator('.role-top3').get_attribute('open') is None
 page.locator('.role-top3 summary').click();assert page.locator('.role-top3-grid section').count()==4;assert page.locator('.role-top3-grid li').count()==12;assert page.locator('.role-top3-grid').is_visible();assert page.locator('.practical-rank-card').all_text_contents()==before
 for width in [390,1100]:
  page.set_viewport_size({'width':width,'height':844});assert page.locator('.role-top3-grid').evaluate('(el)=>el.scrollWidth<=el.clientWidth+1')
 page.locator('.role-top3 summary').click();assert page.locator('.role-top3').get_attribute('open') is None
 page.locator('#practical-show-roster').click();assert page.locator('.roster-item').count()==104;page.locator('[data-no="85"]').click();assert page.locator('.library-detail .research-disclaimer').count()>0;page.locator('#roster-back').click();assert page.locator('.practical-rank-card').all_text_contents()==before
 page.locator('#practical-retest').click()
 for i in range(30):page.locator('[data-practical-answer=unknown]').click()
 assert page.locator('.unscorable-track').is_visible();assert page.locator('.role-top3').count()==0;assert not errs,errs
 print('PASS: Chromium DOM fixture 390/1100px, 30 questions, save/resume, back, five overall, four collapsed role lists with 12 entries, score/order unchanged, 104 roster + disclaimer + return, all unknown held, no JS errors. localStorage mocked; real file:// and live hosting not tested.')
 b.close()
