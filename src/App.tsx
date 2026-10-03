import { useEffect, useRef, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Instagram, Menu, X, MapPin, Mail, Phone, MoveUpRight } from 'lucide-react';
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

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const mobileMotion = gsap.matchMedia();
    const context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: '.intro',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const showHeader = self.progress > 0.18;
          gsap.to('.site-header', {
            autoAlpha: showHeader ? 1 : 0,
            pointerEvents: showHeader ? 'auto' : 'none',
            duration: 0.22,
            ease: 'sine.inOut',
          });
          gsap.to('.site-header > *', { pointerEvents: showHeader ? 'auto' : 'none', duration: 0 });
        },
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: intro,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: '.door-stage',
          invalidateOnRefresh: true,
        },
      });
      timeline
        .to('.door-stage', { scale: 1.08, duration: 1 }, 0)
        .to('.door-left', { xPercent: -92, rotateY: -10, duration: 3, ease: 'none' }, 0.9)
        .to('.door-right', { xPercent: 92, rotateY: 10, duration: 3, ease: 'none' }, 0.9)
        .to('.door-surround', { opacity: 0, duration: 3, ease: 'none' }, 0.9)
        .to('.door-seam', { opacity: 0, duration: 1 }, 1)
        .to('.entry-glow', { opacity: 0.9, scale: 1.5, duration: 2 }, 1)
        .to('.intro-logo', { scale: 0.72, opacity: 0, duration: 1.4 }, 1.1)
        .to('.intro-copy', { yPercent: -20, opacity: 1, duration: 1.2 }, 1.6)
        .to('.intro-hint', { opacity: 0, duration: 0.4 }, 0.25);

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

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((element) => {
        gsap.fromTo(element, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 84%', once: true } });
      });

      gsap.to('.history-image-a', { yPercent: -18, rotate: -3, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.history-image-b', { yPercent: 22, rotate: 4, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.history-image-c', { yPercent: -10, scale: 1.08, scrollTrigger: { trigger: '.history-canvas', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('.blade', { xPercent: 62, rotate: 2, scrollTrigger: { trigger: '.hwando-section', start: 'top 75%', end: 'bottom 65%', scrub: 1 } });
      gsap.to('.sword-glint', { opacity: 1, scrollTrigger: { trigger: '.hwando-section', start: 'top 40%', end: 'bottom 60%', scrub: true } });
    }, intro);
    return () => {
      context.revert();
      mobileMotion.revert();
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
          <span>DO-ZEN-DO <small>CASTELLDEFELS</small></span>
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
          {navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}
        </nav>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main>
        <section className="intro" id="inicio" ref={introRef} aria-label="Entrada a Do-Zen-Do">
          <div className="door-stage">
            <img className="mobile-intro-logo" src="/images/logo/Captura.PNG" alt="Do-Zen-Do Martial Arts" />
            <div className="temple-roof" aria-hidden="true" />
            <div className="door-surround" aria-hidden="true" />
            <div className="entry-glow" />
            <div className="door-frame">
              <div className="door-leaf door-left"><div className="lattice" /><div className="dancheong-panel" /><div className="door-grain" /><div className="handle handle-left" /></div>
              <div className="door-leaf door-right"><div className="lattice" /><div className="dancheong-panel" /><div className="door-grain" /><div className="handle handle-right" /></div>
              <div className="door-seam" />
              <div className="intro-logo"><img src={visualAssets.introMedallion} alt="Logo oficial de Do-Zen-Do" /></div>
            </div>
            <div className="intro-copy"><p className="eyebrow">ARTES MARCIALES COREANAS · CASTELLDEFELS</p><h1>ENTRA<br /><em>EN EL DOJANG</em></h1><p>Una práctica de precisión, presencia y camino.</p></div>
            <div className="intro-hint"><span>Desplázate para entrar</span><ArrowDown size={18} /></div>
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
                    <p>Do-Zen-Do es una escuela de artes marciales coreanas en Castelldefels. Un espacio de práctica donde el entrenamiento físico se encuentra con la atención, el control y el respeto. Cada movimiento se trabaja con intención: aprender a ejecutar con precisión, permanecer presente en cada instante y construir una disciplina que trascienda el entrenamiento.</p>
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

        <section className="final-section section-dark"><p className="eyebrow">DO-ZEN-DO · CASTELLDEFELS</p><h2>Tu camino<br /><em>comienza aquí.</em></h2><button className="primary-button light-button" onClick={() => scrollTo('contacto')}>PRIMERA CLASE <ArrowRight size={17} /></button></section>
      </main>

      <footer className="site-footer"><div className="footer-brand"><img src={visualAssets.logo} alt="Logo de Do-Zen-Do" /><div><strong>DO-ZEN-DO</strong><span>Castelldefels</span></div></div><div className="footer-nav">{navItems.map((item) => <button key={item.id} onClick={() => scrollTo(item.id)}>{item.label}</button>)}</div><a className="social-link" href="#contacto" aria-label="Instagram pendiente de confirmar"><Instagram size={18} /><span>Instagram</span><MoveUpRight size={14} /></a><p className="copyright">© {new Date().getFullYear()} Do-Zen-Do Castelldefels</p></footer>
    </div>
  );
}

export default App;
