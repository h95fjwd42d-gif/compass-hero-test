from playwright.sync_api import sync_playwright
from pathlib import Path
import os,re,base64
os.chdir(Path(__file__).parent)
# Browser navigation blocked by environment. Inline same HTML, JS and CSS; mock localStorage.
html=Path('index.html').read_text()
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+Path(m[1]).read_text().replace('</script','<\\/script')+'</script>',html)
html=html.replace('<head>','<head><script>window.__testStorage=window.__testStorage||new Map();Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__testStorage.get(k)||null,setItem:(k,v)=>window.__testStorage.set(k,String(v)),removeItem:k=>window.__testStorage.delete(k)}});</script>')
html=html.replace('<link rel="stylesheet" href="style.css" />','<style>'+Path('style.css').read_text()+'</style>')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--allow-file-access-from-files']); page=b.new_page(viewport={'width':390,'height':844}); errs=[];page.on('pageerror',lambda e:errs.append(str(e)))
 page.set_content(html);page.locator('#start').click(); assert page.locator('#q-number').inner_text()=='01'
 page.locator('[data-answer=yes]').click();page.set_content(html);page.locator('#continue').click();assert page.locator('#q-number').inner_text()=='02';page.locator('#previous').click();assert page.locator('#q-number').inner_text()=='01'
 for i in range(20):
  assert page.locator('#q-number').inner_text()==str(i+1).zfill(2)
  if i==19: assert '結果は変わりません' in page.locator('#q-guide').inner_text()
  page.locator('[data-answer=yes]').click()
 assert page.locator('#result').is_visible();assert page.locator('[data-light-track]').count()==3;assert page.locator('.light-ranks article').count()==15
 page.locator('#result-roster').click();page.locator('#roster-back').click();assert page.locator('#result').is_visible();page.set_content(html);assert page.locator('#result').is_visible();page.locator('#light-revise').click();assert page.locator('#q-number').inner_text()=='20';page.locator('[data-answer=no]').click();assert page.locator('#result').is_visible();page.locator('#retest').click()
 for i in range(20):page.locator('[data-answer=unknown]').click()
 assert page.locator('.light-ranks article').count()==0;page.locator('#result-home').click();page.locator('#start-practical').click();assert page.locator('#practical-quiz').is_visible();assert page.locator('#practical-number').inner_text()=='01';assert not errs,errs
 print('PASS Chromium DOM fixture 390px (mock localStorage): 20問、保存再開、前問、最終質問、3軸TOP5、図鑑、再読込、全不明保留、ガチ開始。JS例外0。');b.close()
