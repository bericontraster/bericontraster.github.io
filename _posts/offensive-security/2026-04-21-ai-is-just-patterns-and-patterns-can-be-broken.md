---
title: AI is Just Patterns — And Patterns Can Be Broken
date: 2026-04-21 12:00:00 +0500
image:
    path: "https://miro.medium.com/v2/resize:fit:828/format:webp/0*NLay0w3JSKuBFOXO.gif"
    alt: Brain
toc: true
comments: true
published: True
tags: cybersecurity pentesting ai-hacking
categories: ["Offensive Security"]
description: "AI is built on patterns but those patterns aren’t unbreakable. This article explores how artificial intelligence works, its limitations, and how understanding its pattern-based nature reveals both its power and its weaknesses."
---

Welcome reader, I know I’m a little late in the game. Life has been a bit chaotic lately since I moved to a new country for better opportunities. It’s not easy to keep your passion alive when you’re just trying to get by, but I didn’t want to let that go. I’m still figuring things out, but I decided to start anyway.

Why Learn AI Hacking?
---------------------

Well, there could be a couple of reasons. AI is everywhere right now, almost every company is integrating it into their products and workflows. At the same time, it’s actually very interesting to see how these systems can be pushed into giving up information they normally wouldn’t. Some people might want to learn it out of curiosity, some for security, and some just because why not.

So let’s get straight into it. In this part, I’ll give a brief introduction to how AI actually works. In the upcoming articles, we’ll move towards real exploitation and advanced methods. Follow along if you want to go deeper.

Introduction to Artifical Intelligence
--------------------------------------

Before we jump into hacking AI, we need to understand what AI actually is. A lot of people throw around words like Artificial Intelligence and Machine Learning like they are magic, but in reality it’s just math, data, and patterns working together.

Artificial Intelligence is basically machines trying to act smart like humans. That could be anything from recognizing your face, recommending you videos, or even talking to you. But most of what we call AI today is actually Machine Learning. Machine Learning is a part of AI where systems learn from data instead of being explicitly programmed. Instead of telling a machine exactly what to do, we give it tons of examples and it figures out patterns on its own.

For example, if you show a model thousands of pictures of cats and dogs, it starts understanding what makes a cat a cat and a dog a dog. Not because it “knows” like we do, but because it sees patterns in pixels. Same thing happens with text models, they don’t understand language like humans, they just predict what comes next based on patterns they have seen before.

And this is where things get interesting for us. Because if something is just predicting based on patterns, then maybe… just maybe… we can manipulate those patterns. That’s where AI hacking comes into play.

![Layers of Artifical Intellegence](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*jLUE2z6ki9CO-Roubi_Erw.png)

### Important Areas of AI

**Natural Language Processing (NLP):** This is the part of AI that deals with human language. Like how machines read, understand and respond to text or speech. Chatbots, translators, voice assistants all come under this. It looks smart, but most of the time it’s just predicting words based on patterns.

**Computer Vision:** This is about making machines “see”. It takes images or videos and tries to understand what’s inside them. Like facial recognition, object detection, or even self driving cars. Again, it’s not really seeing like humans, it’s just analyzing pixels and patterns.

**Robotics:** This is where AI meets the real world. Robots use AI to make decisions and perform tasks. It could be anything from industrial robots in factories to humanoid robots. Here AI is not just thinking, it’s acting.

**Expert Systems:** These are systems designed to make decisions like a human expert. They follow rules and knowledge given by humans to solve specific problems. Like medical diagnosis systems or financial decision tools. Not very “intelligent” but still useful in many areas.

Machine Learning (ML)
---------------------

This is where machines actually “learn” from data. Instead of writing hard rules, we give the system a lot of examples and it figures things out on its own. It’s not really learning like humans, it’s just adjusting numbers again and again until it gets better at predicting things. Below are the following categories of ML.

### Supervised Learning

In this type, the model learns from labeled data. Meaning we already know the correct answers and we train the model using that. Like giving it images with labels “cat” or “dog” so it learns the difference. It’s like learning with a teacher who keeps correcting you.

### Unsupervised Learning

Here, there are no labels. The model just gets raw data and tries to find patterns by itself. It groups similar things together without being told what they are. It’s more like exploring without guidance, sometimes useful, sometimes confusing.

### Reinforcement Learning

This one is more like trial and error. The model learns by interacting with an environment and getting rewards or penalties. If it does something right, it gets rewarded, if wrong, it gets punished. Over time it learns what actions give the best results. Kind of like training a pet, but with math behind it.

Deep Learning (DL)
------------------

This is a more advanced part of Machine Learning that uses something called neural networks. These are inspired by the human brain, but don’t let that fool you, it’s still just layers of math stacked together. The “deep” part comes from having many layers, which helps the model learn more complex patterns.

Instead of just looking at simple features, deep learning models can understand high-level things. Like not just detecting edges in an image, but recognizing faces, emotions, or even generating completely new content.

### Important Concepts

**Neural Networks (ANNs):** These are the core of deep learning. Also called Artificial Neural Networks. They are made up of layers (input, hidden, output) where each layer processes data and passes it forward. The deeper the network, the more complex patterns it can learn. But also, the harder it becomes to understand what’s really going on inside.

**Activation Functions:** These decide whether a neuron should “activate” or not. Without them, the network would just be a simple linear model. Functions like [ReLU](https://en.wikipedia.org/wiki/Rectified_linear_unit) or [Sigmoid](https://en.wikipedia.org/wiki/Sigmoid_function) help the model learn complex patterns instead of just straight lines.

**Loss Function:** This tells the model how wrong it is. After making a prediction, the model compares it with the correct answer and calculates an error. The higher the loss, the worse the prediction.

**Backpropagation:** This is how the model learns from its mistakes. It takes the error from the loss function and sends it backward through the network, adjusting the weights to improve future predictions.

**Optimizer:** This is what actually updates the model’s weights based on the error. It decides how big or small the changes should be. Common ones include things like [Gradient Descent](https://en.wikipedia.org/wiki/Gradient_descent) or Adam.

**Hyperparameters:** These are settings we choose before training the model. Like how fast it should learn, how many layers it has, or how many times it should go through the data. These are not learned by the model, but they affect how well it learns.

### Training Process

Just like other ML models, deep learning models learn by adjusting weights based on errors. They make a prediction, compare it with the correct answer using a loss function, and then use backpropagation and an optimizer to tweak themselves and get better. This happens thousands or even millions of times.

### Black Box Problem

Deep learning models can become so complex that even the people who build them don’t fully understand how they make decisions. This makes them powerful, but also risky, because unexpected behavior can happen and it’s hard to explain why.

**Example:** If you train a deep learning model on faces, it doesn’t just memorize one face. It starts learning patterns like eyes, nose, shapes, and how they are arranged. That’s handled by neural networks, refined using loss functions, and improved step by step using backpropagation and optimizers.

Generative AI
-------------

This is a type of AI that doesn’t just analyze data, it creates new stuff. Instead of just recognizing patterns, it uses those patterns to generate text, images, code, or even videos. Tools like chatbots or image generators come under this.

It works by learning from huge amounts of data and then predicting what should come next. For example, in text generation, it looks at previous words and tries to guess the next one. It keeps doing this again and again until it forms full sentences or even complete articles.

### Large Language Models (LLMs)

These are the models behind most modern AI chat systems. They are trained on huge amounts of text data like books, websites, articles, and code. The goal is simple, learn patterns in language so they can generate human-like responses.

### How they work ?

At the core, LLMs are just predicting the next word. You give it a sentence, and it tries to guess what word should come next based on everything it has seen during training. Then it takes that word and repeats the process again and again to form full responses.

They use something called transformers, which help the model understand context. Instead of just looking at one word at a time, it looks at the whole sentence and figures out how words relate to each other. That’s why it can keep track of conversations better than older models.

**Tokens:** LLMs don’t actually see words like we do. They break text into smaller pieces called tokens. Sometimes a word is one token, sometimes multiple. The model predicts token by token, not word by word. This matters because small changes in input can lead to very different outputs.

### Training Process

Training an LLM happens in multiple steps and takes massive data and compute.

**Pre-training**: First, the model is trained on a huge dataset with no specific task. It just learns language patterns by predicting missing or next words. This is where it learns grammar, facts, and general knowledge.

**Fine-tuning:** After that, the model is trained on more specific and cleaner data to make it more useful. This can include conversations, instructions, or domain-specific data.

**Reinforcement Learning (**[**RLHF**](https://en.wikipedia.org/wiki/Reinforcement_learning_from_human_feedback)**):** This is where humans come in. The model’s responses are ranked, and it learns what kind of answers are better or safer. This helps align the model with human expectations.

**Example:** If you type “The sky is…”, the model predicts something like “blue” because it has seen that pattern millions of times. But if you ask a complex question, it breaks it into patterns and predicts a response step by step, making it look like it actually understands.

### Types of Generative Models

Not all generative AI works the same way. There are different types of models behind the scenes, each with its own way of creating data. Some are better at images, some at text, and some at both.

**GANs (**[**Generative Adversarial Networks**](https://en.wikipedia.org/wiki/Generative_adversarial_network)**):** This one is actually very interesting. It works using two models, one generates fake data and the other tries to detect if it’s real or fake. They basically compete with each other until the generated output becomes very realistic.
**Example:** Deepfakes. Tools that generate realistic human faces or swap faces in videos use GANs. Websites like [_ThisPersonDoesNotExist_](https://thispersondoesnotexist.com/) are classic examples.

**VAEs (**[**Variational Autoencoders**](https://en.wikipedia.org/wiki/Variational_autoencoder)**):** These models try to learn a compressed version of data and then recreate it. Instead of just copying, they generate slightly new variations based on what they learned. They are more controlled compared to GANs but sometimes less sharp in output.
**Example:** Image generation where you slightly change features, like generating different versions of the same face or design variations.

[**Autoregressive Models**](https://en.wikipedia.org/wiki/Autoregressive_model)**:** These models generate data one step at a time. In text, they predict the next word based on previous words. In images, they generate pixel by pixel or patch by patch.
**Example:** Most text generators and chatbots work this way, predicting one word at a time to form sentences.

[**Diffusion Models**](https://en.wikipedia.org/wiki/Diffusion_model)**:** These are newer and very powerful. They work by starting with random noise and slowly turning it into meaningful data step by step. Basically, they learn how to “clean” noise into something useful.
**Example:** AI image generators like [Stable Diffusion](https://en.wikipedia.org/wiki/Stable_Diffusion) or [DALL·E](https://en.wikipedia.org/wiki/DALL-E) create highly detailed images from text prompts using this approach.

![captionless image](https://miro.medium.com/v2/resize:fit:540/format:webp/0*_w6EeC4DMwdrMKcm.gif)

Relationship between AI, ML and DL
----------------------------------

People often get confused between these three, but it’s actually pretty simple. Artificial Intelligence is the big picture, Machine Learning is a part of it, and Deep Learning is a part of Machine Learning.

AI is the overall idea of making machines act smart. Machine Learning is how we actually make that happen by letting systems learn from data. And Deep Learning is a more advanced way of doing Machine Learning using neural networks.

You can think of it like layers. AI is the outer layer, inside that is Machine Learning, and inside that is Deep Learning.

**How they work together:** In real systems, these are not separate things, they work together. For example, an AI system like a chatbot is built using Machine Learning models, and those models might use Deep Learning to understand and generate responses.

Machine Learning helps the system learn from data, Deep Learning helps it handle complex tasks like understanding language or images, and AI is the final result that we interact with.

**Example:** When you talk to a chatbot, AI is the whole system you see. Machine Learning is what trained it on data, and Deep Learning is what helps it understand your message and generate a reply.

### Why AI is Vulnerable?

Even though AI looks smart, it has no real understanding. It depends completely on data and patterns. If the data is biased, incomplete, or manipulated, the model will behave in unexpected ways. This is where things start getting interesting, because instead of attacking code, we can start attacking the model itself.

Everything in AI depends on data. If the data is bad, the model is bad. If the data is poisoned, the model can be manipulated. Most people focus on the model, but attackers often focus on the data because it’s easier to control.

Conclusion
----------

Now if you look at all of this closely, one thing becomes clear. These systems are not actually intelligent, they are just pattern machines. And anything that depends on patterns can be influenced, manipulated, or broken if you understand it well enough. That’s exactly what we are going to explore next. Things like jailbreaking, prompt injection etc.

Thanks for reading. I hope it proved useful. See you in the next one! If you have any questions, feel free to reach out [bericontraster.com](http://www.bericontraster.com).