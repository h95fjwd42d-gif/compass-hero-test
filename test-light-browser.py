from playwright.sync_api import sync_playwright
from pathlib import Path
import os,re
os.chdir(Path(__file__).parent)
# Navigation is restricted in the test environment. Inline a DOM fixture; storage is an in-memory mock, not native localStorage.
html=Path('index.html').read_text()
html=re.sub(r'<script src="([^"]+)"></script>',lambda m:'<script>'+Path(m[1]).read_text().replace('</script','<\\/script')+'</script>',html)
html=html.replace('<head>','<head><script>window.__lightTestStorage=window.__lightTestStorage||new Map();Object.defineProperty(window,"localStorage",{configurable:true,value:{getItem:k=>window.__lightTestStorage.get(k)||null,setItem:(k,v)=>window.__lightTestStorage.set(k,String(v)),removeItem:k=>window.__lightTestStorage.delete(k)}});</script>')
html=html.replace('<link rel="stylesheet" href="style.css" />','<style>'+Path('style.css').read_text()+'</style>')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':390,'height':844});errs=[];page.on('pageerror',lambda e:errs.append(str(e)));page.set_content(html);page.locator('#start').click();assert page.locator('#q-number').inner_text()=='01';page.locator('[data-answer=yes]').click();page.set_content(html);page.locator('#continue').click();assert page.locator('#q-number').inner_text()=='02';page.locator('#previous').click();assert page.locator('#q-number').inner_text()=='01';
 for i in range(20):
  assert page.locator('#q-number').inner_text()==str(i+1).zfill(2)
  page.locator('[data-answer=yes]' if i%3!=1 else '[data-answer=no]').click()
 assert page.locator('#result').is_visible();assert page.locator('[data-light-track]').count()==3;assert page.locator('.light-ranks article').count()==15;page.locator('[data-feedback-track=personality][data-feedback=good]').click();page.locator('#result-roster').click();page.locator('#roster-back').click();assert page.locator('#result').is_visible();page.set_content(html);assert page.locator('#result').is_visible();assert page.locator('[data-feedback-track=personality][data-feedback=good]').evaluate("e=>e.classList.contains('selected')");page.locator('#light-revise').click();assert page.locator('#q-number').inner_text()=='20';page.locator('[data-answer=no]').click();assert page.locator('#result').is_visible();page.locator('#retest').click();
 for i in range(20): page.locator('[data-answer=unknown]').click()
 assert page.locator('.light-ranks article').count()==0;page.locator('#result-home').click();page.locator('#start-practical').click();assert page.locator('#practical-quiz').is_visible();assert page.locator('#practical-number').inner_text()=='01';assert not errs,errs;print('PASS Chromium 390px: 20 questions, resume/reload simulation/back, 3x5 cards, mock storage feedback persistence, roster return, revise, all unknown hold, practical start; pageerrors=0');b.close()

