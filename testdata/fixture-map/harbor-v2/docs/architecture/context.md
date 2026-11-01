# harbor: context (L1)

The ferry-ticket shop, the people who use it and the systems outside it.
Curated by hand; changed only by a ruled record.

```mermaid
flowchart LR
    %% c4: context
    clerk["Clerk"]
    traveller["Traveller"]
    harbor["Harbor<br/>ferry-ticket shop"]
    card_gateway["Card gateway"]
    mail_relay["Mail relay"]
    clerk --> harbor
    traveller --> harbor
    harbor --> card_gateway
    harbor --> mail_relay
```

| node | level | kind | status | evidence |
|---|---|---|---|---|
| `clerk` | context | person | exists | curated: `context.md` |
| `traveller` | context | person | exists | curated: `context.md` |
| `harbor` | context | system | exists | record `0001` |
| `card_gateway` | context | external | exists | curated: `context.md` |
| `mail_relay` | context | external | exists | curated: `context.md` |
