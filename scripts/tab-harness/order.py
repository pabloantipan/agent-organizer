import json,sys
out=sys.argv[1]
# One Tab-order list per screen and flag, cut where the order wraps.
def order(p):
    out=[]; seen=set()
    for l in open(p):
        d=json.loads(l)
        if 'step' not in d: continue
        a=d['active']
        if a.get('tag') in (None,'BODY'):
            out.append('(nothing: focus on body)'); break
        key=(a['tag'],a['name'],tuple(a['rect']))
        if key in seen: out.append('(wraps)'); break
        seen.add(key)
        kind='link' if a['tag']=='A' else a['tag'].lower()
        if a['tag']=='DIV' and a.get('role'): kind=f"div role={a['role']}"
        out.append(f"{a['region']}: {kind} \"{a['name'][:60]}\"")
    return out
for screen in ['home','initiatives','overview','settings']:
    for flag,label in [('off','before, flag off'),('on','after, flag on')]:
        o=order(f'{out}/k4-{screen}-{flag}.jsonl')
        print(f"\n### {screen}, {label} ({len([x for x in o if not x.startswith('(')])} stops)")
        for i,x in enumerate(o,1): print(f"{i}. {x}")
