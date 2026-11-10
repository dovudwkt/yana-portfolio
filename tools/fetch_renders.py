"""Download selected renders from Drive at 2000px (thumbnail endpoint)."""
import json, re, os, sys, urllib.request, concurrent.futures as cf
SRC = os.path.join(os.path.dirname(__file__), '..', '_src')
tree = json.load(open(f'{SRC}/tree.json'))
idx = json.load(open(f'{SRC}/sheet_index.json'))
byname = {re.sub(r'[^\w.-]+', '_', t['path']) + '.jpg': t for t in tree}

PICK = {
  # Квартира Душанбе
  'du_living_arch': 'du6', 'du_living_mural': 'du9', 'du_living_tv': 'du7', 'du_living_long': 'du5',
  'du_dining': 'du8', 'du_kitchen_long': 'du19', 'du_kitchen_niche': 'du20', 'du_kitchen_dining': 'du17',
  'du_kitchen_arch': 'du18', 'du_kids_chairs': 'du13', 'du_kids_bed': 'du12', 'du_kids_wide': 'du15',
  'du_master_bed': 'du22', 'du_master_niche': 'du21', 'du_master_wardrobe': 'du23', 'du_master_wide': 'du24',
  'du_laundry_mirror': 'du27', 'du_laundry': 'du25', 'du_laundry_2': 'du26',
  'du_hall': 'du29', 'du_hall_2': 'du30', 'du_hall_3': 'du31', 'du_medallion': 'du32',
  'du_bath_floral': 'du2', 'du_bath_leaves': 'du3', 'du_bath_green': 'du4',
  # Вилла Кипр
  'cy_ext_day': 'cy213', 'cy_ext_night': 'cy217', 'cy_pergola_day': 'cy214', 'cy_pergola_night': 'cy219',
  'cy_bbq_day': 'cy215', 'cy_bbq_night': 'cy218', 'cy_garden': 'cy222', 'cy_ext_side': 'cy224', 'cy_pergola_2': 'cy227',
  'cy_dining': 'cy18', 'cy_kitchen': 'cy19', 'cy_living_tv': 'cy115', 'cy_living': 'cy116', 'cy_living_2': 'cy120',
  'cy_stairs': 'cy17', 'cy_master': 'cy134', 'cy_master_2': 'cy131', 'cy_bath_stone': 'cy129', 'cy_bath': 'cy130',
  'cy_office': 'cy122', 'cy_yoga': 'cy125', 'cy_wc': 'cy11', 'cy_boy': 'cy22', 'cy_boy_2': 'cy23',
  'cy_girl': 'cy25', 'cy_girl_desk': 'cy28', 'cy_room_orange': 'cy211',
  # Проект Санкт-Петербург
  'sp_kitchen': 'sp5', 'sp_dining': 'sp6', 'sp_kitchen_2': 'sp7', 'sp_bed': 'sp9', 'sp_bed_2': 'sp8',
  'sp_kids': 'sp3', 'sp_kids_2': 'sp4', 'sp_kids_3': 'sp2', 'sp_living_tv': 'sp10', 'sp_hall': 'sp11',
  'sp_hall_2': 'sp12', 'sp_bath': 'sp0', 'sp_bath_2': 'sp1',
}
out = f'{SRC}/renders'
def get(item):
    key, sk = item
    t = byname[idx[sk]]
    dst = f'{out}/{key}.jpg'
    if os.path.exists(dst): return key, 'cached'
    d = urllib.request.urlopen(f"https://drive.google.com/thumbnail?id={t['id']}&sz=w2000", timeout=60).read()
    open(dst, 'wb').write(d)
    return key, f'{len(d)//1024}KB'
with cf.ThreadPoolExecutor(10) as ex:
    for k, r in ex.map(get, PICK.items()): print(k, r)
json.dump(PICK, open(f'{SRC}/pick.json', 'w'), indent=0)
