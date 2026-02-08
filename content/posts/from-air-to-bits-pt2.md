---
title: "From Air to Bits: From Motion to Electricity"
date: "2026-02-08"
excerpt: "How microphones convert mechanical vibration into electrical signals — dynamic, condenser, and beyond."
tags: ["audio", "dsp", "networking"]
series:
  name: "From Air to Bits"
  slug: "from-air-to-bits"
  part: 2
  total: 3
---

The diaphragm is moving — it's faithfully tracking the pressure wave, but that isn't very useful in isolation. The next step is to convert that mechanical vibration into an electrical signal -- the process is called **transduction**, and mics accomplish it leveraging different physical principles.

We'll focus on the two most common and illustrative approaches: **dynamic** (electromagnetic induction) and **condenser** (variable capacitance) -- understanding both should yield solid intuition for how any mic turns motion into **voltage**.

## Dynamic Microphones: Motion through a Magnetic Field

The dynamic mic is the conceptually simplest design. A small coil of wire is attached directly to the back of the diaphragm, suspended inside the field of a permanent magnet:

![Dynamic Microphone|full](/blog/from-air-to-bits/dynamic-mic.svg)

The coil (a conductive material) moves inline with the diaphragm -- this is **Faraday's law** of electromagnetic induction:

$$
\mathcal{E} = -N \frac{d\Phi_B}{dt}
$$

where $N$ is the number of turns in the coil, and $\Phi_B$ is the magnetic flux through it. Since the coil moves back and forth with the diaphragm, the rate of flux change — and therefore the voltage — directly tracks the velocity of the diaphragm. Louder sounds move the diaphragm faster, producing a larger voltage.

The dynamic mic's output is proportional to diaphragm *velocity*, not displacement. A slow, large movement produces less voltage than a fast, small one. This is why dynamic mics naturally roll off at very low frequencies. The elegance of this design is its simplicity. There's no external power source, no active electronics — just a coil, a magnet, and physics.

---

## Condenser Microphones: A Vibrating Capacitor

The condenser mic takes a completely different approach. Instead of a coil and magnet, it uses the diaphragm as one plate of a **capacitor**, with a fixed backplate positioned just behind it:

![Condenser Microphone|full](/blog/from-air-to-bits/condenser-mic.svg)

A capacitor's capacitance depends on the distance between its plates:

$$
C = \varepsilon_0 \frac{A}{d}
$$

where $\varepsilon_0$ is the permittivity of free space, $A$ is the plate area, and $d$ is the gap between them. As the diaphragm moves, $d$ changes, and so does $C$.

Here's the trick: a fixed charge $Q$ is applied across the plates (via phantom power from the preamp, or permanently embedded in an electret material). Since $Q = CV$, and $Q$ is held constant, a change in capacitance produces a change in voltage:

$$
V = \frac{Q}{C} = \frac{Qd}{\varepsilon_0 A}
$$

As $d$ increases (diaphragm moves away), voltage goes up. As $d$ decreases, voltage drops. The output voltage directly tracks the *displacement* of the diaphragm — not velocity like the dynamic mic. This distinction matters: condenser mics maintain sensitivity at low frequencies where dynamic mics start to fall off.

Because the diaphragm doesn't need to carry a coil, it can be made extremely thin and light — sometimes just a few microns of metallized plastic. Less mass means it can respond to faster pressure changes, which is why condenser mics generally have superior high-frequency response and transient detail. The cost is complexity: you need either phantom power (typically 48V) or electret material, plus a built-in impedance converter, since the capsule's output impedance is extremely high.

---

## Other Transduction Methods

Dynamic and condenser cover the vast majority of microphones you'll encounter, but a few other designs are worth mentioning:

| Type | Mechanism | Typical Use |
|------|-----------|-------------|
| Ribbon | Thin metal ribbon suspended in a magnetic field — the ribbon *is* the diaphragm. Generates voltage via electromagnetic induction. Excellent transient response, but historically fragile with very low output. | Studio vocals, broadcast |
| Piezoelectric | Materials that generate voltage when physically deformed. | Contact mics, instrument pickups |
| MEMS | Miniaturized condenser capsules etched onto silicon chips. Same variable-capacitance principle, just miniaturized to a remarkable degree. | Phones, laptops, smart speakers |

---

Regardless of the transduction mechanism, the end result is the same: the microphone outputs a continuous, time-varying voltage that is an electrical analog of the original acoustic pressure wave. The transducer's job is done — air pressure variations are now voltage variations, ready to be carried downstream.

## References

- [How Do Microphones Work?](https://www.market.com/computers-tablets/microphones/guides/how-do-microphones-work/)
