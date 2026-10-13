import json,sys
for p in sys.argv[1:]:
    print("==",p)
    for l in open(p):
        d=json.loads(l)
        if 'step' in d:
            a=d['active']
            if a.get('tag') in (None,'BODY'): print(' ',d['step'],a.get('tag')); continue
            c=a.get('card'); 
            print(' ',d['step'],a['tag'],a['region'],repr(a['name'][:40]),'fv' if a['focusVisible'] else '-',a['outline'].split(' rgb')[0], 'scr' if a['onScreen'] else 'OFF', (f"card {c['id']} raised={c['raised']} {c['background']}" if c else ''))
        elif 'eval' in d and d['eval'] not in ('undefined',): print('  eval',d['eval'][:160])
