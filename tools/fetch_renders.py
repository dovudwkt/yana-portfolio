"""Download selected renders from Drive at 2000px (thumbnail endpoint)."""
import json, re, os, sys, urllib.request, concurrent.futures as cf
SRC = os.path.join(os.path.dirname(__file__), '..', '_src')
tree = json.load(open(f'{SRC}/tree.json'))
idx = json.load(open(f'{SRC}/sheet_index.json'))
byname = {re.sub(r'[^\w.-]+', '_', t['path']) + '.jpg': t for t in tree}

PICK = {
  # Квартира Душанбе
  'du_living_arch': 'hanifa6', 'du_living_mural': 'hanifa9', 'du_living_tv': 'hanifa7', 'du_living_long': 'hanifa5',
  'du_dining': 'hanifa8', 'du_kitchen_long': 'hanifa19', 'du_kitchen_niche': 'hanifa20', 'du_kitchen_dining': 'hanifa17',
  'du_kitchen_arch': 'hanifa18', 'du_kids_chairs': 'hanifa13', 'du_kids_bed': 'hanifa12', 'du_kids_wide': 'hanifa15',
  'du_master_bed': 'hanifa22', 'du_master_niche': 'hanifa21', 'du_master_wardrobe': 'hanifa23', 'du_master_wide': 'hanifa24',
  'du_laundry_mirror': 'hanifa27', 'du_laundry': 'hanifa25', 'du_laundry_2': 'hanifa26',
  'du_hall': 'hanifa29', 'du_hall_2': 'hanifa30', 'du_hall_3': 'hanifa31', 'du_medallion': 'hanifa32',
  'du_bath_floral': 'hanifa2', 'du_bath_leaves': 'hanifa3', 'du_bath_green': 'hanifa4',
  # Вилла Кипр
  'cy_ext_day': 'anna213', 'cy_ext_night': 'anna217', 'cy_pergola_day': 'anna214', 'cy_pergola_night': 'anna219',
  'cy_bbq_day': 'anna215', 'cy_bbq_night': 'anna218', 'cy_garden': 'anna222', 'cy_ext_side': 'anna224', 'cy_pergola_2': 'anna227',
  'cy_dining': 'anna18', 'cy_kitchen': 'anna19', 'cy_living_tv': 'anna115', 'cy_living': 'anna116', 'cy_living_2': 'anna120',
  'cy_stairs': 'anna17', 'cy_master': 'anna134', 'cy_master_2': 'anna131', 'cy_bath_stone': 'anna129', 'cy_bath': 'anna130',
  'cy_office': 'anna122', 'cy_yoga': 'anna125', 'cy_wc': 'anna11', 'cy_boy': 'anna22', 'cy_boy_2': 'anna23',
  'cy_girl': 'anna25', 'cy_girl_desk': 'anna28', 'cy_room_orange': 'anna211',
  # Проект Санкт-Петербург
  'sp_kitchen': 'dzhona5', 'sp_dining': 'dzhona6', 'sp_kitchen_2': 'dzhona7', 'sp_bed': 'dzhona9', 'sp_bed_2': 'dzhona8',
  'sp_kids': 'dzhona3', 'sp_kids_2': 'dzhona4', 'sp_kids_3': 'dzhona2', 'sp_living_tv': 'dzhona10', 'sp_hall': 'dzhona11',
  'sp_hall_2': 'dzhona12', 'sp_bath': 'dzhona0', 'sp_bath_2': 'dzhona1',
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
