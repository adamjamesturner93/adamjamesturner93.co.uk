---
title: "Good governance shouldn't be the opposite of engineering speed"
slug: governance-and-engineering-speed
description: 'Controls can support timely decisions when they are designed around evidence, ownership and risk.'
date: '2026-10-31'
publishedAt: '2026-10-31'
category: responsible-change
draft: false
coverImage: '/images/blog/governance-and-engineering-speed.svg'
coverImageAlt: ''
illustrative: true
relatedArticles:
  - leadership-outside-your-team
  - legacy-modernisation-business-problem
---

## Ask what the control is protecting

Governance often becomes visible as a meeting or approval. The underlying purpose may be entirely reasonable: protect customer data, maintain service continuity or ensure accountability. Starting with the protected outcome makes it possible to question the mechanism without dismissing the risk.

## Separate evidence from ceremony

An approval meeting is not itself evidence that a change is safe. Tests, traceable decisions and recovery plans may provide stronger evidence, provided they address the actual risk. Automating evidence collection can reduce repeated manual work, but automation does not remove the need to judge whether the evidence is sufficient.

## Match scrutiny to consequence

A reversible presentation change and a difficult data migration deserve different treatment. Define risk criteria that teams can apply consistently, with an escalation path for uncertainty. Risk-based decisions need clear boundaries; otherwise a faster route can become an incentive to classify everything as low risk.

## Make accountability practical

Teams need to know which decisions they own and which require another perspective. Decision records should explain the alternatives, the accepted risk and the reason for revisiting a choice. A short record that someone actually uses is more valuable than an elaborate template completed after the decision.

## Improve the control as well as delivery

Track the time spent waiting for decisions alongside the failures controls are intended to prevent. Faster approval is not success if important risks are missed; fewer incidents are not conclusive if delivery has stopped. Review both outcomes and ask whether the control still provides useful information. Good governance should make responsible action easier to repeat.

## Waiting is not the same as examining risk

Consider a hypothetical change that spends several days waiting for a review, then receives a few minutes of attention. Its elapsed approval time says little about the quality of the scrutiny. Conversely, a rapid decision backed by strong evidence may be entirely responsible. Speed and care are not simple opposites, although a particular change can certainly demand more time.

The distinction matters because teams can optimise the visible procedure while missing its purpose. A checklist may be completed perfectly even when nobody understands a difficult failure mode. A fast process may look impressive while quietly transferring work to an operations team. Ask where the risk is being examined and who will live with the consequences, rather than judging the process by its most visible ceremony.

## Evidence needs an audience

Automated tests and deployment records are useful only when their meaning is understood. A green build is not proof that every relevant risk has been considered. What did the tests exercise? What assumptions remain? What happens if the change must be reversed after data has already moved?

Different reviewers need different levels of detail. An engineer may need a technical failure analysis; a business owner may need to understand service interruption and customer impact. Translating evidence is part of the work. Producing a large bundle of logs and calling it assurance merely moves the interpretation problem to someone else.

Google’s SRE material on implementing service-level objectives offers a concrete example of connecting reliability expectations to decisions. It does not replace regulatory obligations or every organisation’s controls. It does illustrate the value of an explicit agreement about acceptable service performance, rather than treating reliability as an unlimited demand that automatically overrides other work.

## Make the exceptional path usable

No control framework anticipates every situation. A team may face a security issue, a failing dependency or an urgent operational correction. If the only way to act is to bypass a process silently, the process is asking people to choose between transparency and effectiveness.

An exceptional path should identify who can authorise action, which evidence is needed immediately and what review follows. It should also distinguish urgency from inconvenience. Otherwise every approaching deadline becomes a reason to skip a control. A usable exception process makes accountability clearer; it does not remove it.

The follow-up matters just as much. Review whether the exception was justified and whether a recurring pattern suggests that the ordinary process needs changing. Punishing every exception can encourage concealment. Accepting every exception without learning can make the normal process meaningless.

## Design governance with the people doing the work

Engineers are often asked to comply with controls they had little part in shaping. Risk and assurance colleagues may, in turn, be asked to approve changes without enough context to understand them. Both positions create frustration. Bringing those perspectives together early can reveal requirements that are easier to satisfy in the delivery system than through repeated manual requests.

This collaboration will not remove every disagreement. Some obligations genuinely restrict what can be done, and some engineering preferences will need to give way. The useful ambition is a process in which those boundaries are understood and decisions can be explained.

A practical starting question is: **which control consumes the most effort while producing the least useful information?** Examine it with the people responsible for the risk. Keep the protected outcome explicit, try a better mechanism and review the result. The strongest argument for change is a more reliable way to make responsible decisions, with less friction for everyone involved.

## References and further reading

- [Related perspective: Implementing SLOs — Google SRE](https://sre.google/workbook/implementing-slos/). Offered as further reading, rather than evidence for every argument above.
