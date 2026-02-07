---
title: "From Air to Bits: The Complete Path of Digital Audio"
date: "2026-02-06"
excerpt: "Following a single sound from physical phenomena all the way to network packets."
tags: ["audio", "dsp", "networking"]
series:
  name: "From Air to Bits"
  slug: "from-air-to-bits"
  part: 1
  total: 3
---

If you've ever built an audio pipeline but didn't really understand the underlying physical phenomena, or need a holistic refresher on the subject, this one's for you.

![From Air to Bits](/blog/from-air-to-bits/air-to-bits-pyramid.png)

In having to build an audio system in Rust for my DIY home automation project, I realized that while i was building a functional system, I lacked intuition on the fundamental physical phenomena behind the code. 

This series is aimed at developing that intuition, following a single sound from the physical phenomena all the way to network packets.

---

## Sound as Pressure Waves

I find it best to learn with a simple example in mind:

![From Air to Bits|full](/blog/from-air-to-bits/example-scenario.svg)

A person (source) says "hello world", a mic (sink) picks it up, that gets converted to meaningful electrical signals and finally sent across the wire. Intentionally very hand-wavey, so we will break it down piecemeal. Since we are first focusing on the physics of it, the latter part isn't shown on the diagram; we'll add to it later.

In physics, sound is a pressure wave that moves through ambient air (≈ 101 kPa). The source of sound converts energy (eg human throat muscles) into pressure deviations from the ambient baseline.

![Sound pressure air molecules|full](/blog/from-air-to-bits/pressure-wave-molecules.svg)

Above you can see the behavior these waves exhibit: compressions when air molecules come together and rarefactions when they spread out. 

Mathematically, these pressure variations are expressed by the wave equation, shown below in one dimension for simplicity:

$$
\frac{\partial^2 p}{\partial t^2} = c^2 \frac{\partial^2 p}{\partial x^2}
$$

Another way of digesting this is the following: **at a given point the pressure variation through time is proportional to how the pressure curves in space around that point.** 

Take the act of speaking, we generate high pressure points, disturbing the surrounding air in the form of pressure variations permeating outwards. Meanwhile, at the original point, equilibrium is re-established almost instantly at ambient pressure. You don't keep hearing what you said.

The medium on earth is air, and sound moves through it at the speed c:

$$
c = \sqrt{\frac{\gamma R T}{M}}
$$

here $\gamma$ is the heat capacity ratio of the gas (~1.4 for air), $R$ is the universal gas constant, $T$ is temperature in Kelvin, and $M$ is the molar mass of air. **The key takeaway: sound travels faster in hotter, lighter gases.**

 Why? Well hotter means more molecular activity, so ease of propagation. Lighter gases follow a similar principle: less inertia, easier to incite motion.

For a simple sinusoidal wave (shown above), the speed, frequency, and wavelength are related by:

$$
c = f\lambda
$$

This is the relationship that connects what you hear (frequency, perceived as pitch) to the physical scale of the wave (wavelength). Some concrete numbers to build intuition:

| Frequency | Wavelength | What it sounds like |
|-----------|-----------|-------------------|
| 20 Hz | 17 m | Lowest audible rumble |
| 300 Hz | 1.1 m | Low end of speech |
| 3.4 kHz | 10 cm | Upper range for speech intelligibility |
| 20 kHz | 1.7 cm | Upper limit of human hearing |

---

## The Microphone: Pressure to Motion

These pressure waves need to be understood somehow, and that's what microphones do. I had no idea how they actually worked until I dug in — there are, of course, different mic designs; below is the basic mechanism:

![Microphone Mechanics|full](/blog/from-air-to-bits/mic-schematic.svg)

A microphone diaphragm is a thin membrane exposed to air on one side. The incoming pressure variations push the entire membrane in and out — think of a drum skin flexing as sound hits it. The force on the diaphragm is the pressure difference across it, integrated over its area:

$$
F = \Delta p \cdot A
$$

The diaphragm itself can be modeled as a **damped harmonic oscillator** — the classic spring-mass-damper system from physics:

$$
m\ddot{x} + b\dot{x} + kx = F(t)
$$

where $m$ is the diaphragm's mass, $k$ is its stiffness, $b$ is damping, and $F(t)$ is the **driving force** from the incoming pressure wave. While you're speaking, the sound wave continuously drives the diaphragm, and it tracks the pressure variations in real time. When you stop speaking, the damping term $b\dot{x}$ is what causes the diaphragm to settle back to rest rather than ringing indefinitely.

This model has a natural **resonant** frequency; or in other words the frequency at which an external force causes the maximum oscillatory response:

$$
f_0 = \frac{1}{2\pi}\sqrt{\frac{k}{m}}
$$

If the microphone is underdamped and $f_0$ falls within the audible range, you get an undesirable peak in the frequency response. Cheap microphones often exhibit this. A well-designed mic is critically or slightly overdamped, giving a flat response across the audible range. Here's a visualization of the different damping scenarios:

![Damping Scenarios|full](/blog/from-air-to-bits/damping-graph.svg)

For microphones, critically damped is the sweet spot — fastest faithful tracking without the resonant ringing.

---

## References

- [How Do Microphones Work?](https://www.market.com/computers-tablets/microphones/guides/how-do-microphones-work/)

- [The Wave Equation (Princeton University Press)](https://assets.press.princeton.edu/chapters/s9912.pdf)

