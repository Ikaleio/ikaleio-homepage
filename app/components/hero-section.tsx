import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useLanguage } from "~/hooks/use-language";
import { SectionReveal, RevealItem } from "~/components/section-reveal";
import { Github, Send } from "lucide-react";

const shardShapes = [
  { clip: "polygon(0 0, 50% 0, 56% 43%, 0 33%)", center: [25, 19] },
  { clip: "polygon(50% 0, 100% 0, 100% 28%, 56% 43%)", center: [77, 18] },
  { clip: "polygon(0 33%, 56% 43%, 43% 62%, 0 58%)", center: [23, 49] },
  { clip: "polygon(56% 43%, 100% 28%, 100% 62%, 43% 62%)", center: [76, 51] },
  { clip: "polygon(0 58%, 43% 62%, 32% 100%, 0 100%)", center: [20, 80] },
  { clip: "polygon(43% 62%, 68% 100%, 32% 100%)", center: [48, 84] },
  { clip: "polygon(43% 62%, 100% 62%, 100% 100%, 68% 100%)", center: [78, 82] },
] as const;

function impactShake(intensity: number, duration: number) {
  const content = document.querySelector("main");
  if (!content) return;

  content.animate(
    [
      { transform: "translate3d(0, 0, 0)" },
      { transform: `translate3d(${intensity}px, ${-intensity * 0.45}px, 0)` },
      { transform: `translate3d(${-intensity * 0.7}px, ${intensity * 0.3}px, 0)` },
      { transform: `translate3d(${intensity * 0.35}px, 0, 0)` },
      { transform: "translate3d(0, 0, 0)" },
    ],
    { duration, easing: "ease-out" }
  );
}

function animateScrollTo(targetY: number, duration: number) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, startY + distance * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else resolve();
    }

    requestAnimationFrame(tick);
  });
}

function createImpactBurst(pageX: number, pageY: number) {
  const burst = document.createElement("div");
  Object.assign(burst.style, {
    position: "absolute",
    left: `${pageX}px`,
    top: `${pageY}px`,
    width: "10px",
    height: "10px",
    marginLeft: "-5px",
    marginTop: "-5px",
    border: "1px solid hsl(var(--primary) / 0.8)",
    borderRadius: "999px",
    boxShadow: "0 0 14px hsl(var(--primary) / 0.65)",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(burst);
  burst.animate(
    [
      { transform: "scale(0.4)", opacity: 1 },
      { transform: "scale(6)", opacity: 0 },
    ],
    { duration: 420, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" }
  );

  for (let index = 0; index < 6; index++) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / 6 + 0.25;
    const distance = 24 + (index % 3) * 7;
    Object.assign(particle.style, {
      position: "absolute",
      left: `${pageX}px`,
      top: `${pageY}px`,
      width: `${2 + (index % 2)}px`,
      height: `${2 + (index % 2)}px`,
      borderRadius: "999px",
      background: "hsl(var(--foreground) / 0.8)",
      pointerEvents: "none",
      zIndex: "9999",
    });
    document.body.appendChild(particle);
    particle.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 0.9 },
        {
          transform: `translate3d(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance + 18}px, 0) scale(0)`,
          opacity: 0,
        },
      ],
      { duration: 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" }
    );
    setTimeout(() => particle.remove(), 550);
  }

  setTimeout(() => burst.remove(), 450);
}

function shatterElement(el: HTMLElement, avatarCenterX: number) {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  const scrollY = window.scrollY;
  const scrollX = window.scrollX;
  const impactClientX = Math.max(rect.left, Math.min(avatarCenterX, rect.right));
  const impactRatio = (impactClientX - rect.left) / rect.width;

  el.style.visibility = "hidden";

  const layer = document.createElement("div");
  Object.assign(layer.style, {
    position: "absolute",
    left: `${rect.left + scrollX}px`,
    top: `${rect.top + scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: "none",
    zIndex: "9998",
  });
  document.body.appendChild(layer);

  shardShapes.forEach(({ clip, center }, index) => {
    const shard = document.createElement("div");
    const clone = el.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    Object.assign(clone.style, {
      position: "absolute",
      inset: "0",
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: "0",
      opacity: "1",
      visibility: "visible",
      transform: "none",
      transition: "none",
      pointerEvents: "none",
    });
    Object.assign(shard.style, {
      position: "absolute",
      inset: "0",
      clipPath: clip,
      willChange: "transform, opacity, filter",
      filter: "drop-shadow(0 0 1px hsl(var(--primary) / 0.4))",
    });
    shard.appendChild(clone);
    layer.appendChild(shard);

    const horizontal =
      (center[0] / 100 - impactRatio) * Math.min(rect.width * 0.75, 130);
    const vertical = 26 + (center[1] / 100) * 72;
    const rotationDirection = center[0] / 100 < impactRatio ? -1 : 1;
    const rotation = rotationDirection * (8 + index * 2.5);

    shard.animate(
      [
        { transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)", opacity: 1 },
        {
          offset: 0.14,
          transform: `translate3d(${horizontal * 0.12}px, 3px, 0) rotate(${rotation * 0.12}deg) scale(0.995)`,
          opacity: 1,
        },
        {
          transform: `translate3d(${horizontal}px, ${vertical}px, 0) rotate(${rotation}deg) scale(0.96)`,
          opacity: 0,
          filter: "drop-shadow(0 4px 3px hsl(var(--background) / 0.55)) blur(1.5px)",
        },
      ],
      {
        duration: 760 + index * 32,
        delay: index * 10,
        easing: "cubic-bezier(0.18, 0.72, 0.25, 1)",
        fill: "forwards",
      }
    );
  });

  createImpactBurst(
    impactClientX + scrollX,
    rect.top + scrollY + Math.min(rect.height * 0.35, 28)
  );
  setTimeout(() => layer.remove(), 1100);
}

export function HeroSection() {
  const { t } = useLanguage();
  const avatarControls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const easterEggActiveRef = useRef(false);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarRef = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const handleDoubleClick = async () => {
    if (isSpinning || easterEggActiveRef.current) return;
    setIsSpinning(true);
    await avatarControls.start({
      rotate: [0, 360],
      y: [0, 20, -12, 8, -5, 2, 0],
      transition: {
        rotate: { duration: 1.2, ease: "easeInOut" },
        y: {
          duration: 1,
          times: [0, 0.18, 0.35, 0.52, 0.7, 0.85, 1],
          ease: "easeOut",
        },
      },
    });
    if (!easterEggActiveRef.current) {
      avatarControls.set({ rotate: 0, y: 0 });
    }
    setIsSpinning(false);
  };

  const handleClick = useCallback(() => {
    if (easterEggActiveRef.current) return;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 3) {
      setClickCount(0);
      triggerEasterEgg();
    } else {
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1500);
    }
  }, [clickCount]);

  const triggerEasterEgg = useCallback(async () => {
    easterEggActiveRef.current = true;
    setEasterEggActive(true);
    avatarControls.stop();
    avatarControls.set({ rotate: 0, y: 0, scale: 1, opacity: 1 });

    const avatar = avatarRef.current;
    if (!avatar) {
      easterEggActiveRef.current = false;
      setEasterEggActive(false);
      return;
    }

    const avatarRect = avatar.getBoundingClientRect();
    const avatarCenterX = avatarRect.left + avatarRect.width / 2;
    const avatarStartY = avatarRect.top + window.scrollY;
    const avatarCenterY = avatarStartY + avatarRect.height / 2;

    const main = document.querySelector("main");
    if (!main) {
      easterEggActiveRef.current = false;
      setEasterEggActive(false);
      return;
    }

    const targets = Array.from(
      main.querySelectorAll<HTMLElement>("[data-smash-target]")
    )
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element,
          pageTop: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        };
      })
      .filter(
        (target) =>
          target.pageTop + target.height > avatarCenterY &&
          target.width > 0 &&
          target.height > 0
      )
      .sort((a, b) => a.pageTop - b.pageTop);

    // Targets in the same visual row break together at one impact point.
    const targetGroups: Array<{
      pageTop: number;
      elements: HTMLElement[];
    }> = [];
    for (const target of targets) {
      const previous = targetGroups.at(-1);
      if (previous && Math.abs(target.pageTop - previous.pageTop) < 40) {
        previous.elements.push(target.element);
      } else {
        targetGroups.push({
          pageTop: target.pageTop,
          elements: [target.element],
        });
      }
    }

    const pageHeight = document.documentElement.scrollHeight;
    const totalFallDistance = pageHeight - avatarStartY + 200;
    let currentY = 0;
    const viewportThreshold = window.innerHeight * 0.58;
    const maximumScroll = Math.max(pageHeight - window.innerHeight, 0);

    for (let index = 0; index < targetGroups.length; index++) {
      const group = targetGroups[index];
      const targetY = Math.max(
        group.pageTop - avatarStartY - avatarRect.height * 0.72,
        currentY
      );
      const distance = targetY - currentY;
      const duration = Math.max(Math.sqrt(distance / 600) * 0.5, 0.16);
      const avatarAbsoluteY = avatarStartY + targetY;
      const targetScroll = Math.min(
        Math.max(avatarAbsoluteY - viewportThreshold, window.scrollY),
        maximumScroll
      );

      await Promise.all([
        avatarControls.start({
          y: targetY,
          rotate: (index + 1) * 185,
          transition: {
            y: { duration, ease: [0.4, 0, 1, 1] },
            rotate: { duration, ease: "linear" },
          },
        }),
        animateScrollTo(targetScroll, duration * 1000),
      ]);

      group.elements.forEach((element) =>
        shatterElement(element, avatarCenterX)
      );
      impactShake(Math.min(4 + index * 0.45, 7), 230);
      await avatarControls.start({
        scale: [1, 1.07, 0.97, 1],
        transition: { duration: 0.14, ease: "easeOut" },
      });

      currentY = targetY;
      await new Promise((resolve) => setTimeout(resolve, 55));
    }

    const exitDistance = totalFallDistance + 420;
    const exitDuration = 0.55;
    await Promise.all([
      avatarControls.start({
        y: exitDistance,
        rotate: (targetGroups.length + 2) * 185,
        opacity: 0,
        transition: {
          y: { duration: exitDuration, ease: [0.4, 0, 1, 1] },
          rotate: { duration: exitDuration, ease: "linear" },
          opacity: { duration: 0.22, delay: exitDuration - 0.22 },
        },
      }),
      animateScrollTo(maximumScroll, exitDuration * 1000),
    ]);
    impactShake(11, 420);
  }, [avatarControls]);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex min-h-[85vh] flex-col items-center justify-center px-6 py-24"
    >
      <SectionReveal className="flex max-w-2xl flex-col items-center gap-6 text-center">
        {/* Avatar */}
        <RevealItem>
          <motion.img
            ref={avatarRef}
            src="/images/avatar.jpg"
            alt="Ikaleio"
            className="relative z-[9999] h-28 w-28 cursor-pointer rounded-full border-2 border-border object-cover shadow-lg select-none"
            whileHover={easterEggActive ? undefined : { scale: 1.05 }}
            animate={avatarControls}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          />
        </RevealItem>

        {/* Name with shimmer */}
        <RevealItem>
          <h1
            data-smash-target
            className="text-shimmer font-serif text-5xl font-bold tracking-tight md:text-6xl"
          >
            {t("heroName")}
          </h1>
        </RevealItem>

        {/* Title */}
        <RevealItem>
          <p
            data-smash-target
            className="text-readable text-lg font-medium text-muted-foreground md:text-xl"
          >
            {t("heroTitle")}
          </p>
        </RevealItem>

        {/* Bio */}
        <RevealItem>
          <p
            data-smash-target
            className="text-readable max-w-lg text-balance leading-relaxed text-foreground/80"
          >
            {t("heroBio")}
          </p>
        </RevealItem>

        {/* Tech stack */}
        <RevealItem>
          <p
            data-smash-target
            className="text-readable font-mono text-sm tracking-wide text-muted-foreground"
          >
            {t("heroStack")}
          </p>
        </RevealItem>

        {/* Social icons */}
        <RevealItem className="flex gap-3 pt-2">
          <motion.a
            data-smash-target
            href="https://github.com/Ikaleio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            whileHover={{ y: -3, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </motion.a>
          <motion.a
            data-smash-target
            href="https://t.me/Ikaleio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary"
            whileHover={{ y: -3, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            aria-label="Telegram"
          >
            <Send className="h-5 w-5" />
          </motion.a>
        </RevealItem>
      </SectionReveal>
    </section>
  );
}
