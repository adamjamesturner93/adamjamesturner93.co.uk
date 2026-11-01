---
title: 'Legacy modernisation is a business problem, not just a technology problem'
slug: legacy-modernisation-business-problem
description: 'Modernisation becomes clearer when the unit of progress is a business capability, not a replacement system.'
date: '2026-10-11'
publishedAt: '2026-10-11'
category: technology-strategy
draft: false
coverImage: '/images/blog/legacy-modernisation-business-problem.svg'
coverImageAlt: ''
illustrative: true
---

## Start with the cost of standing still

An old system is not automatically an urgent problem. Its age matters when it constrains a business capability, increases operational exposure or makes necessary change disproportionately expensive. A modernisation proposal should identify that consequence before choosing a replacement architecture.

## Replacement is a portfolio decision

Money and attention spent replacing a platform cannot be spent elsewhere. That opportunity cost belongs in the discussion alongside maintenance costs. Compare credible options: targeted repairs, gradual extraction, replacement and deliberate retention. Each option carries different uncertainty, and the most attractive technical destination may have the least credible route.

## Choose a useful increment

Incremental migration creates opportunities to learn, but only if increments deliver something observable. Moving a layer without reducing risk or enabling change can become activity without progress. A better milestone is a capability that can operate independently, with clear ownership and a tested route back if assumptions fail.

## Account for the transition

Running two systems can be more expensive than running either one alone. Data reconciliation, operational training and temporary integration work need explicit funding. Define what permits the old capability to be retired and who can make that decision. Without a retirement condition, a migration can leave an organisation with two permanent systems.

## Measure the constraint

Choose measures connected to the original problem: the time to change a business rule, the frequency of recovery failures or the effort required to satisfy an audit request. Architecture remains important, but it is a means of improving those outcomes. Revisit the proposal if the original business constraint changes.

## The business case needs more than a finish line

“Move to the new platform” describes a destination. It does not explain why reaching it should take priority over everything else. A more useful case connects technical constraints to consequences that decision-makers can assess. Perhaps product changes require coordination across several teams. Perhaps recovery depends on knowledge held by too few people. Those are different problems, and they may justify very different interventions.

Avoid the temptation to make the numbers look precise before the evidence is there. A range with explicit assumptions can be more honest than a confident estimate whose uncertainty is hidden. State what is known, what has been inferred and what a small investigation could establish. An investment decision should improve as evidence arrives; it should not become a promise everyone feels obliged to defend.

## Discover what the old system really does

A system’s documented functions are only part of its role. Operations teams may depend on particular reports. Customers may rely on behaviour that was never deliberately designed. A manual workaround may be compensating for a gap in another system entirely. These are not arguments for preserving every quirk, but they are reasons to investigate before replacing it.

Martin Fowler’s discussion of the Strangler Fig approach describes gradual modernisation and the difficulty of understanding existing behaviour. It is a useful alternative to the assumption that a replacement can simply reproduce what is already there. The approach does not eliminate complexity: it changes when and where that complexity must be confronted.

A practical discovery exercise should therefore include the people who use, support and govern the capability. Ask what must continue to work during the transition, what can be retired, and what nobody yet understands. That last category deserves explicit space in the plan. An unknown dependency is more manageable when it is acknowledged than when it is disguised as a small integration task.

## The organisation has to migrate as well

Changing a system often changes the distribution of work. A new service boundary may need a new ownership arrangement. A platform that enables frequent releases may be paired with an approval process designed for infrequent ones. The technical design and operating model can undermine each other if they are developed in isolation.

This is where modernisation becomes a leadership problem. Who will support the capability? Who controls its priorities? What skills need developing? Which temporary responsibilities will disappear after migration? These questions are not administrative details to settle after implementation. They influence whether the new system can be operated responsibly at all.

There is also a human cost to declaring existing work obsolete. People who maintained the old system may understand risks that a replacement team has not encountered. Treating their knowledge as an input to the design is both more respectful and more useful than positioning modernisation as a rescue from the past.

## Make stopping a legitimate outcome

A modernisation programme should have points where its direction can change. If an early increment reveals that the original constraint can be removed with a smaller intervention, that is useful learning. Continuing solely because the replacement was approved confuses commitment with judgement.

A question worth carrying into the next proposal is: **what business capability will become measurably easier to change, safer to operate or cheaper to sustain?** If the answer is still mainly a list of technologies, the case needs another pass. Technical ambition is valuable. Giving it a clear purpose makes it easier to support, challenge and deliver.

## References and further reading

- [Related perspective: Strangler Fig Application — Martin Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html). Offered as further reading, rather than evidence for every argument above.
