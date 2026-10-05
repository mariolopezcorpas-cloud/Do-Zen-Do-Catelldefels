import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Instagram, Menu, X, MapPin, Mail, Phone, MoveUpRight } from 'lucide-react';
import { scheduleData, siteData, visualAssets } from '@/data/siteData';

gsap.registerPlugin(ScrollTrigger);

const navItems = [
  { label: 'Inicio', id: 'inicio' },
  { label: 'Qué es Do-Zen-Do', id: 'about' },
  { label: 'Horarios', id: 'horarios' },
  { label: 'Contacto', id: 'contacto' },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const introRef = useRef<HTMLElement>(null);
  const welcomeLeadTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const textElement = welcomeLeadTextRef.current;
    if (!textElement) return;

    const text = 'Bienvenido a la web oficial de';
    const characters = Array.from(text);
    let characterIndex = 0;
    let timerId = 0;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      textElement.textContent = text;
      return;
    }

    textElement.textContent = '';
    const typeNextCharacter = () => {
      if (characterIndex >= characters.length) {
        textElement.classList.remove('is-typing');
        return;
      }

      const character = characters[characterIndex];
      textElement.textContent += character;
      characterIndex += 1;
      timerId = window.setTimeout(typeNextCharacter, character === ' ' ? 80 : 52);
    };
    timerId = window.setTimeout(() => {
      textElement.classList.add('is-typing');
      typeNextCharacter();
    }, 450);

    return () => {
      window.clearTimeout(timerId);
      textElement.classList.remove('is-typing');
    };
  }, []);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    const targets = Array.from(document.querySelectorAll<HTMLElement>(
      'main > section:not(.intro) :is(h1, h2, h3, p, .vertical-note, .value-line, .text-link, .primary-button, .contact-form label, .schedule-row, .map-placeholder), .site-footer :is(.footer-brand, .footer-nav button, .social-link, .copyright)',
    )).filter((element) => (
      !element.closest('.practice-scroll')
      && !element.parentElement?.closest('.schedule-row')
      && !element.parentElement?.closest('.map-placeholder')
    ));
    const sectionIndexes = new Map<Element, number>();
    targets.forEach((element) => {
      const section = element.closest('section');
      const index = section ? sectionIndexes.get(section) ?? 0 : 0;
      if (section) sectionIndexes.set(section, index + 1);
      element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 120}ms`);
      element.classList.add('scroll-reveal');
      element.classList.add('scroll-reveal-pending');
    });

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target as HTMLElement;
        element.classList.remove('scroll-reveal-pending');
        element.classList.add('scroll-reveal-visible');
        currentObserver.unobserve(element);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      targets.forEach((element) => {
        element.classList.remove('scroll-reveal', 'scroll-reveal-pending', 'scroll-reveal-visible');
        element.style.removeProperty('--reveal-delay');
      });
    };
  }, []);

  useEffect(() => {
    const video = introRef.current?.querySelector<HTMLVideoElement>('.welcome-sword-source');
    const canvas = introRef.current?.querySelector<HTMLCanvasElement>('.welcome-sword-canvas');
    if (!video || !canvas) return;

    canvas.width = 480;
    canvas.height = 853;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    let seekFrameId = 0;
    let videoFrameCallbackId: number | null = null;
    let videoFrameCallbackActive = false;

    const drawKeyedFrame = () => {
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = frame.data;

      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        const greenExcess = green - Math.max(red, blue);
        const key = Math.min(1, Math.max(0, (greenExcess - 8) / 52));
        const strength = key * key * (3 - 2 * key);

        if (strength > 0) {
          const spill = Math.max(0, green - Math.max(red, blue));
          pixels[index + 1] = Math.min(green, green - spill * Math.max(strength, 0.9));
          pixels[index + 3] = Math.round(pixels[index + 3] * (1 - strength));
        }
      }

      context.putImageData(frame, 0, 0);
    };

    const updateKeyedFrame = () => {
      drawKeyedFrame();
      videoFrameCallbackId = video.requestVideoFrameCallback(updateKeyedFrame);
    };

    const startVideoFrameCallbacks = () => {
      if (videoFrameCallbackActive || typeof video.requestVideoFrameCallback !== 'function') return;
      videoFrameCallbackActive = true;
      videoFrameCallbackId = video.requestVideoFrameCallback(updateKeyedFrame);
    };

    const syncVideoToScroll = () => {
      seekFrameId = 0;
      const targetTime = Number(video.dataset.targetTime ?? 0);
      if (
        video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA
        && !video.seeking
        && Math.abs(video.currentTime - targetTime) > 0.008
      ) {
        video.currentTime = targetTime;
      }
    };

    const scheduleVideoSync = () => {
      if (!seekFrameId) seekFrameId = requestAnimationFrame(syncVideoToScroll);
    };

    const handleMetadata = () => {
      video.pause();
      ScrollTrigger.refresh();
      scheduleVideoSync();
    };
    const handleFrame = () => {
      drawKeyedFrame();
      startVideoFrameCallbacks();
      scheduleVideoSync();
    };

    video.dataset.targetTime = '0';
    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('canplaythrough', handleMetadata);
    video.addEventListener('loadeddata', handleFrame);
    video.addEventListener('seeked', handleFrame);
    video.addEventListener('scrollprogress', scheduleVideoSync);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) handleMetadata();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      handleFrame();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('canplaythrough', handleMetadata);
      video.removeEventListener('loadeddata', handleFrame);
      video.removeEventListener('seeked', handleFrame);
      video.removeEventListener('scrollprogress', scheduleVideoSync);
      if (seekFrameId) cancelAnimationFrame(seekFrameId);
      if (videoFrameCallbackId !== null && typeof video.cancelVideoFrameCallback === 'function') {
        video.cancelVideoFrameCallback(videoFrameCallbackId);
      }
    };
  }, []);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const mobileMotion = gsap.matchMedia();
    let inertiaFrameId = 0;
    let lastFrameTime = 0;
    const updateMobileCenter = () => {
      intro.style.setProperty('--welcome-mobile-center-x', `${document.documentElement.clientWidth / 2}px`);
    };
    updateMobileCenter();
    window.addEventListener('resize', updateMobileCenter);
    const context = gsap.context(() => {
      const swordVideo = intro.querySelector<HTMLVideoElement>('.welcome-sword-source');
      if (swordVideo) {
        const swordCanvas = intro.querySelector<HTMLCanvasElement>('.welcome-sword-canvas');
        const swordGlow = intro.querySelector<HTMLElement>('.welcome-sword-glow');
        const playback = { targetProgress: 0, currentProgress: 0, velocity: 0 };
        const mobileViewport = window.matchMedia('(max-width: 768px)');

        const updateVisualProgress = (progress: number) => {
          if (swordVideo.duration > 0) {
            swordVideo.dataset.targetTime = String(progress * swordVideo.duration);
            swordVideo.dispatchEvent(new Event('scrollprogress'));
          }
          if (swordCanvas) {
            if (mobileViewport.matches) {
              swordCanvas.style.setProperty('--hwando-angle', '0deg');
              swordCanvas.style.setProperty('--hwando-y', `${swordCanvas.clientHeight * 0.28 * progress}px`);
            } else {
              swordCanvas.style.setProperty('--hwando-angle', `${16 * progress}deg`);
              swordCanvas.style.removeProperty('--hwando-y');
            }
          }
          if (swordGlow) {
            swordGlow.style.setProperty('--glow-x', `${52 - progress * 3}%`);
            swordGlow.style.setProperty('--glow-y', `${48 + progress * 2}%`);
          }
        };

        const animateInertia = (now: number) => {
          const elapsed = Math.min((now - lastFrameTime) / 1000, 0.05);
          lastFrameTime = now;
          const difference = playback.targetProgress - playback.currentProgress;
          playback.velocity += (difference * 6 - playback.velocity * 2.7) * elapsed;
          playback.currentProgress += playback.velocity * elapsed;

          if (
            Math.abs(playback.targetProgress - playback.currentProgress) < 0.0005
            && Math.abs(playback.velocity) < 0.001
          ) {
            playback.currentProgress = playback.targetProgress;
            playback.velocity = 0;
            inertiaFrameId = 0;
          } else {
            if (playback.currentProgress < 0 || playback.currentProgress > 1) {
              playback.currentProgress = gsap.utils.clamp(0, 1, playback.currentProgress);
              playback.velocity = 0;
            }
            inertiaFrameId = requestAnimationFrame(animateInertia);
          }

          updateVisualProgress(playback.currentProgress);
        };

        const followScrollProgress = () => {
          if (!inertiaFrameId) {
            lastFrameTime = performance.now();
            inertiaFrameId = requestAnimationFrame(animateInertia);
          }
        };

        gsap.to(playback, {
          targetProgress: 1,
          duration: 1,
          ease: 'none',
          onUpdate: followScrollProgress,
          scrollTrigger: {
            id: 'welcome-hwando',
            trigger: intro,
            start: 'top top',
            end: () => `+=${Math.round(window.innerHeight * 1.2)}`,
            pin: true,
            scrub: 1.2,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              playback.targetProgress = self.progress;
              followScrollProgress();
            },
          },
        });
        updateVisualProgress(0);
      }

      mobileMotion.add('(max-width: 760px)', () => {
        const heroSection = intro.nextElementSibling as HTMLElement | null;
        const heroImage = heroSection?.querySelector<HTMLImageElement>('.hero-image');
        if (!heroSection || !heroImage) return;

        const getPanDistance = () => Math.min(0, heroSection.clientWidth - heroImage.getBoundingClientRect().width);
        const pan = gsap.timeline({
          repeat: -1,
          yoyo: true,
          paused: true,
        });
        pan.to(heroImage, { x: getPanDistance, duration: 20, ease: 'none' })
          .to(heroImage, { x: getPanDistance, duration: 1, ease: 'none' });
        const trigger = ScrollTrigger.create({
          trigger: heroSection,
          start: 'top bottom',
          end: 'bottom top',
          onEnter: () => pan.play(),
          onEnterBack: () => pan.play(),
          onLeave: () => pan.pause(),
          onLeaveBack: () => pan.pause(),
          invalidateOnRefresh: true,
        });

        return () => {
          trigger.kill();
          pan.kill();
        };
      });

      const aboutSection = document.querySelector<HTMLElement>('.about-section');
      if (aboutSection) {
        const aboutBackdrop = aboutSection.querySelector<HTMLElement>('.about-scene-backdrop');
        const aboutOpening = aboutSection.querySelector<HTMLElement>('.about-scene-opening');
        const aboutStage = aboutSection.querySelector<HTMLElement>('.about-stage');
        const parchmentCards = Array.from(aboutSection.querySelectorAll<HTMLElement>('.practice-scroll'));
        const aboutTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: aboutSection,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: aboutStage ?? false,
            pinSpacing: false,
            invalidateOnRefresh: true,
          },
        });

        if (aboutBackdrop && aboutOpening) {
          aboutTimeline
            .to(aboutBackdrop, { opacity: 0, duration: 0.9 }, 0)
            .to(aboutOpening, { opacity: 0, y: -26, scale: 0.985, filter: 'blur(2px)', duration: 0.9 }, 0);
        }

        const scrollDistance = () => window.innerWidth * (window.innerWidth <= 760 ? 1.15 : 1.25);
        let cardStart = 1;

        parchmentCards.forEach((card) => {
          aboutTimeline
            .fromTo(card,
              { x: () => -scrollDistance(), y: 0, rotation: -1.5, scale: 0.97, autoAlpha: 0 },
              { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1, duration: 1.4, ease: 'power1.out' },
              cardStart,
            )
            .to({}, { duration: 1.5 }, cardStart + 1.4)
            .to(card,
              { x: () => scrollDistance(), y: 0, rotation: 1.5, scale: 0.98, autoAlpha: 0, duration: 1.4, ease: 'power1.in' },
              cardStart + 2.9,
            );
          cardStart += 3.55;
        });
      }

      gsap.to('.history-image-a', { yPercent: -18, rotate: -3, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.history-image-b', { yPercent: 22, rotate: 4, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.history-image-c', { yPercent: -10, scale: 1.08, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.blade', { xPercent: 62, rotate: 2, scrollTrigger: { trigger: '.hwando-section', start: 'top 75%', end: 'bottom 65%', scrub: 1 } });
      gsap.to('.sword-glint', { opacity: 1, scrollTrigger: { trigger: '.hwando-section', start: 'top 40%', end: 'bottom 60%', scrub: true } });
    }, intro);
    return () => {
      context.revert();
      if (inertiaFrameId) cancelAnimationFrame(inertiaFrameId);
      mobileMotion.revert();
      window.removeEventListener('resize', updateMobileCenter);
      intro.style.removeProperty('--welcome-mobile-center-x');
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage('El formulario está preparado para conectar con el servicio de contacto de la escuela.');
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <button className="brand-mark" onClick={() => scrollTo('inicio')} aria-label="Volver al inicio">
          <img src={visualAssets.logo} alt="Logo de Do-Zen-Do" />
          <span>DO-ZEN-DO <small>CASTELLDEFELS · GAVÀ</small></span>
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main>
        <section className="intro" id="inicio" ref={introRef} aria-label="Bienvenido a Do-Zen-Do">
          <div className="welcome-hero">
            <div className="welcome-panel">
              <div className="welcome-content">
                <p className="welcome-lead"><span aria-hidden="true" /><span className="welcome-lead-text" ref={welcomeLeadTextRef} /></p>
                <img className="welcome-wordmark" src="/images/logo/logopng.png" alt="Do-Zen-Do Martial Arts" />
                <div className="welcome-divider" />
                <div className="welcome-signature">
                  <img src={visualAssets.introMedallion} alt="Emblema de Do-Zen-Do" />
                  <div>
                    <p className="welcome-location">CASTELLDEFELS · GAVÀ</p>
                    <p className="welcome-tagline">DISCIPLINA PARA EL CUERPO. CLARIDAD PARA LA MENTE.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="welcome-reserved">
              <div className="welcome-sword-glow" aria-hidden="true" />
              <video
                className="welcome-sword-source"
                src="/videos/hwando-unsheathing.mp4"
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                tabIndex={-1}
              />
              <div className="welcome-sword-annotation" aria-label="Hwando, Corea, siglo XIX">
                <span className="welcome-sword-name">환도</span>
                <span className="welcome-sword-detail">HWANDO · COREA · SIGLO XIX</span>
              </div>
              <p className="welcome-sword-caption">PIEZA HISTÓRICA · REFERENCIA VISUAL · KOREAN CULTURE AND INFORMATION SERVICE</p>
            </div>
            <div className="welcome-sword-stage" aria-hidden="true">
              <div className="welcome-sword-anchor">
                <canvas className="welcome-sword-canvas" />
              </div>
            </div>
            <div className="welcome-scroll"><span>01</span><i aria-hidden="true" /><span>DESLIZA PARA CONTINUAR</span></div>
          </div>
        </section>

        <section className="hero-section section-dark">
          <img className="hero-image" src="/images/gimnasiodozendo.jpg" alt="Interior del gimnasio Do-Zen-Do" />
          <div className="hero-overlay" />
          <div className="hero-content reveal"><p className="eyebrow">DO-ZEN-DO</p><h2>El cuerpo aprende.<br /><em>La mente permanece.</em></h2><button className="text-link" onClick={() => scrollTo('about')}>Conocer la escuela <ArrowRight size={17} /></button></div>
        </section>

        <section className="about-section" id="about" aria-label="La práctica de Do-Zen-Do">
          <div className="about-scroll-track">
            <div className="about-stage">
              <div className="about-scene-backdrop" />
              <div className="about-scene-opening">
                <div className="section-intro"><p className="eyebrow">01 · LA PRÁCTICA</p><h2>Un espacio para<br /><em>volver al centro.</em></h2></div>
                <div className="about-grid">
                  <div className="vertical-note">DO · ZEN · DO</div>
                  <div className="about-copy">
                    <p>Do-Zen-Do es una escuela de artes marciales coreanas con gimnasios en Castelldefels y Gavà. Un espacio de práctica donde el entrenamiento físico se encuentra con la atención, el control y el respeto. Cada movimiento se trabaja con intención: aprender a ejecutar con precisión, permanecer presente en cada instante y construir una disciplina que trascienda el entrenamiento.</p>
                    <div className="value-line"><span>01</span><strong>Precisión</strong><span>02</span><strong>Presencia</strong><span>03</span><strong>Disciplina</strong></div>
                  </div>
                </div>
              </div>
              <div className="practice-scroll-stage" aria-label="Principios de la práctica">
                <article className="practice-scroll" aria-label="01 Precisión">
                  <span className="scroll-rod scroll-rod-top" aria-hidden="true" />
                  <span className="scroll-rod scroll-rod-bottom" aria-hidden="true" />
                  <span className="scroll-edition">ARCHIVO DE PRÁCTICA · DO-ZEN-DO</span>
                  <span className="scroll-number">01</span>
                  <span className="scroll-rule" aria-hidden="true" />
                  <h3>PRECISIÓN</h3>
                  <p>Cada movimiento comienza con atención. La técnica no busca únicamente fuerza, sino control, medida y exactitud.</p>
                  <span className="scroll-seal" aria-hidden="true" />
                </article>
                <article className="practice-scroll" aria-label="02 Presencia">
                  <span className="scroll-rod scroll-rod-top" aria-hidden="true" />
                  <span className="scroll-rod scroll-rod-bottom" aria-hidden="true" />
                  <span className="scroll-edition">ARCHIVO DE PRÁCTICA · DO-ZEN-DO</span>
                  <span className="scroll-number">02</span>
                  <span className="scroll-rule" aria-hidden="true" />
                  <h3>PRESENCIA</h3>
                  <p>Estar presente significa permanecer atento al cuerpo, al movimiento y al momento. La práctica comienza cuando dejamos de movernos en automático.</p>
                  <span className="scroll-seal" aria-hidden="true" />
                </article>
                <article className="practice-scroll" aria-label="03 Disciplina">
                  <span className="scroll-rod scroll-rod-top" aria-hidden="true" />
                  <span className="scroll-rod scroll-rod-bottom" aria-hidden="true" />
                  <span className="scroll-edition">ARCHIVO DE PRÁCTICA · DO-ZEN-DO</span>
                  <span className="scroll-number">03</span>
                  <span className="scroll-rule" aria-hidden="true" />
                  <h3>DISCIPLINA</h3>
                  <p>La disciplina convierte la práctica en camino. Repetir, corregir y continuar: cada sesión construye algo que permanece más allá del entrenamiento.</p>
                  <span className="scroll-seal" aria-hidden="true" />
                </article>
              </div>
            </div>
          </div>
        </section>

        <section className="history-section section-dark" id="historia">
          <div className="history-heading reveal"><p className="eyebrow">02 · HISTORIA</p><h2>Descubrir<br /><em>poco a poco.</em></h2><p>La historia de Do-Zen-Do se incorporará aquí con fotografías, documentos y relatos confirmados por la escuela.</p></div>
          <div className="history-canvas" aria-label="Galería de imágenes de Do-Zen-Do">
            <div className="history-image history-image-a"><img src="/images/HISTORIA%20DE%20DOZENDO.PNG" alt="Fotografía histórica de la práctica de Do-Zen-Do" /></div>
            <div className="history-image history-image-b"><img src="/images/entrenamiento.jpg" alt="Entrenamiento de artes marciales en Do-Zen-Do" /></div>
            <div className="history-image history-image-c"><img src="/images/campeonato.jpg" alt="Participantes de Do-Zen-Do en un campeonato" /></div>
          </div>
        </section>

        <section className="schedule-section section-paper" id="horarios"><div className="schedule-wrap"><div className="reveal"><p className="eyebrow">03 · HORARIOS</p><h2>El tiempo de<br /><em>la práctica.</em></h2><p className="muted">Los horarios definitivos se mostrarán aquí cuando sean confirmados por la escuela.</p></div><div className="schedule-table reveal">{scheduleData.map((item) => <div className="schedule-row" key={item.group}><div><span className="row-label">GRUPO</span><strong>{item.group}</strong></div><div><span className="row-label">DÍAS</span><strong>{item.days}</strong></div><div><span className="row-label">HORA</span><strong>{item.time}</strong></div><p>{item.note}</p></div>)}</div></div></section>

        <section className="hwando-section section-dark"><div className="hwando-copy reveal"><p className="eyebrow">04 · EL CAMINO</p><h2>La forma<br /><em>aparece.</em></h2><p>Una escena simbólica preparada para una Hwando coreana: sin combate, sin violencia, solo la revelación lenta del metal y la intención.</p></div><div className="sword-scene" aria-label="Animación simbólica de una Hwando coreana"><div className="scabbard"><span className="scabbard-cap" /></div><div className="blade"><div className="sword-glint" /></div><div className="sword-hilt"><span /></div></div></section>

        <section className="contact-section section-paper" id="contacto"><div className="contact-layout"><div className="contact-intro reveal"><p className="eyebrow">05 · CONTACTO</p><h2>Comienza<br /><em>el camino.</em></h2><p>Solicita información sobre una primera clase. Los datos de contacto se completarán cuando sean confirmados.</p><div className="contact-details"><p><MapPin size={17} />{siteData.contact.address}</p><p><Phone size={17} />{siteData.contact.phone}</p><p><Mail size={17} />{siteData.contact.email}</p></div></div><form className="contact-form reveal" onSubmit={handleSubmit}><label>Nombre<input required name="name" type="text" placeholder="Tu nombre" /></label><label>Email<input required name="email" type="email" placeholder="tu@email.com" /></label><label>Teléfono<input name="phone" type="tel" placeholder="Opcional" /></label><label>Mensaje<textarea required name="message" rows={4} placeholder="Cuéntanos en qué podemos ayudarte" /></label><button className="primary-button" type="submit">QUIERO PROBAR UNA CLASE <ArrowRight size={17} /></button>{formMessage && <p className="form-message" role="status">{formMessage}</p>}<p className="form-note">El envío real se activará al conectar el servicio de contacto.</p></form></div><div className="map-placeholder"><MapPin size={22} /><span>MAPA PENDIENTE DE DIRECCIÓN CONFIRMADA</span></div></section>

        <section className="final-section section-dark"><p className="eyebrow">DO-ZEN-DO · CASTELLDEFELS · GAVÀ</p><h2>Tu camino<br /><em>comienza aquí.</em></h2><button className="primary-button light-button" onClick={() => scrollTo('contacto')}>PRIMERA CLASE <ArrowRight size={17} /></button></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><img src={visualAssets.logo} alt="Logo de Do-Zen-Do" /><div><strong>DO-ZEN-DO</strong><span>Castelldefels · Gavà</span></div></div><div className="footer-nav">{navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}</div><a className="social-link" href="#contacto" aria-label="Instagram pendiente de confirmar"><Instagram size={18} /><span>Instagram</span><MoveUpRight size={14} /></a><p className="copyright">© {new Date().getFullYear()} Do-Zen-Do Castelldefels · Gavà</p></footer>
    </div>
  );
}

export default App;
