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

## The Signal Chain Before Digitization

Before we can digitize anything, the mic's raw output needs some help. Microphone-level signals are tiny — we're talking millivolts, sometimes microvolts for quiet sources. That's not enough to drive an ADC (analog-to-digital converter) effectively. This is where the **preamp** comes in.

![Signal Chain|full](/blog/from-air-to-bits/adc-signal-chain.svg)

The preamp's job is straightforward: amplify the signal to **line level** (roughly 1–2V peak-to-peak) so the ADC has something meaningful to work with. This is the "gain" knob on your audio interface. Too little gain and your signal is buried in the noise floor of the ADC. Too much and you clip — the signal exceeds the ADC's input range and gets hard-clamped, which sounds terrible.

There's one more stage before digitization that's easy to overlook: the **anti-aliasing filter**. This is a low-pass analog filter that cuts off frequencies above a certain threshold.

## Sampling: Freezing Time

Here's the fundamental problem: an analog voltage is continuous. It exists at every point in time, with infinite resolution. A computer can't store "every point in time" — it needs discrete values at discrete moments. Sampling is the process of measuring the voltage at regular intervals and recording each measurement.

![Sampling|full](/blog/from-air-to-bits/sampling.svg)

The rate at which we take these measurements is the sample rate, measured in Hz (samples per second). CD audio uses 44,100 Hz. Professional audio often uses 48,000 Hz or higher. At 44.1 kHz, we're snapping 44,100 voltage measurements every second.

This immediately raises a question: is that enough? Are we losing information between samples?

### The Nyquist-Shannon Sampling Theorem

This is one of those results that feels too good to be true. The Nyquist-Shannon theorem states that a bandlimited signal can be perfectly reconstructed from its samples, as long as the sample rate is at least twice the highest frequency present in the signal:

$$
f_s \geq 2 f_{\text{max}}
$$

That's it. No approximation, no "close enough" — *perfect* reconstruction, assuming the signal contains no energy above $f_{\text{max}}$. The critical frequency $f_s / 2$ is called the **Nyquist frequency**, and it represents the hard ceiling of what a given sample rate can capture.

For human hearing, which tops out around 20 kHz, a sample rate of 40 kHz would theoretically suffice. CD audio uses 44.1 kHz to give some headroom for the anti-aliasing filter (which can't have an infinitely sharp cutoff in the real world — more on that in a moment).

### Why It Works

The math behind Nyquist-Shannon involves some elegant Fourier analysis, but the intuition is actually pretty graspable. Any bandlimited signal — meaning it contains no frequencies above some maximum $f_{\text{max}}$ — can only change so fast. There's a limit to how much information it carries per unit of time. Two samples per cycle of the highest frequency is exactly enough to capture that rate of change.

Think of it this way: if the highest frequency in your signal is a 20 kHz sine wave, that wave completes 20,000 cycles per second. Sampling at 40 kHz gives you exactly two points per cycle — one at the peak, one at the trough. That's the minimum you need to say "this is a 20 kHz sine wave at this amplitude." Any fewer samples, and you can't distinguish it from a lower frequency.

## Aliasing: What Happens When You Break the Rule

Now the anti-aliasing filter makes sense. If any frequency above the Nyquist frequency sneaks into the ADC, something nasty happens: it doesn't just get lost — it gets **folded back** into the representable frequency range, masquerading as a lower frequency. This is called **aliasing**.

![Aliasing|full](/blog/from-air-to-bits/aliasing.svg)

A 30 kHz tone sampled at 44.1 kHz doesn't just vanish — it shows up as a phantom 14.1 kHz tone ($f_s - f = 44.1 - 30 = 14.1$ kHz). This is audible and wrong. There's no way to remove it after the fact because it's indistinguishable from a real 14.1 kHz signal in the sampled data.

The anti-aliasing filter's job is to kill everything above the Nyquist frequency *before* sampling, so there's nothing left to fold back. This is why it has to be an analog filter — it has to act on the signal before digitization. Once the samples exist, it's too late.

## Quantization: Assigning Numbers

Sampling handles the time axis — we now have voltage measurements at regular intervals. But each measurement is still a continuous voltage value with infinite precision. We need to round each sample to a finite number — that's **quantization**.

![Quantization|full](/blog/from-air-to-bits/quantization.svg)

The number of possible values is determined by the **bit depth**. At 16-bit (CD audio), each sample can be one of $2^{16} = 65{,}536$ discrete levels. At 24-bit (professional audio), that jumps to $2^{24} = 16{,}777{,}216$ levels.

The difference between the actual voltage and the nearest quantization level is called **quantization error** (or quantization noise). It's an unavoidable artifact of the process — you're rounding continuous values to a grid, and some precision is always lost. The question is how much it matters.

### Signal-to-Quantization-Noise Ratio

Each additional bit of depth roughly doubles the number of available levels, which translates to about 6 dB of additional dynamic range:

$$
\text{SQNR} \approx 6.02n + 1.76 \text{ dB}
$$

where $n$ is the number of bits. So 16-bit audio gives you about 96 dB of dynamic range, and 24-bit gives you around 144 dB. For reference, 96 dB is more than enough for most playback scenarios — the distance from a quiet room to the threshold of pain is roughly 100 dB. The extra headroom of 24-bit is mainly valuable during recording and mixing, where you want room for processing without accumulating rounding errors.

### Dithering

There's one more subtlety worth mentioning. When a signal is very quiet — close to the level of a single quantization step — the quantization error stops being random noise and starts correlating with the signal itself. This creates audible **harmonic distortion**, which sounds much worse than noise.

The fix is counterintuitive: you deliberately add a tiny amount of random noise to the signal *before* quantizing. This is called **dithering**, and it randomizes the quantization error, converting nasty harmonic distortion into a smooth, benign noise floor. You're technically making the signal noisier, but perceptually it sounds dramatically better. It's one of those rare cases where adding noise improves quality.

## The Complete Picture

Putting it all together, the analog-to-digital conversion chain looks like this:

1. The **preamp** amplifies the mic-level signal to line level
2. The **anti-aliasing filter** removes frequencies above the Nyquist limit
3. The **sample-and-hold circuit** freezes the voltage at each sample instant
4. The **quantizer** maps each held voltage to the nearest discrete level
5. The result is a stream of integer values — **PCM** (Pulse Code Modulation) — that represents the original sound wave

At 44.1 kHz, 16-bit, stereo, that's $44{,}100 \times 16 \times 2 = 1{,}411{,}200$ bits per second, or about 176 kilobytes per second of raw audio data. That's the number that hits the wire — and it's what we'll be working with from here on.

---

The analog world is behind us now. What started as pressure variations in air has been transduced into voltage variations, then frozen in time and snapped to a grid of integers. The signal is digital — a sequence of numbers that perfectly represents (within the bounds of our sample rate and bit depth) the original sound wave. From here, everything is math.


## References

- [How Do Microphones Work?](https://www.market.com/computers-tablets/microphones/guides/how-do-microphones-work/)
