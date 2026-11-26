/**
 * पद्म पर्व — PADMA PARVA | Royal Heritage Invitation
 * Vertical-scroll experience inspired by reference interaction patterns.
 *  - Tap-to-reveal opener with golden burst + optional intro video
 *  - Themed floating petals + golden dust particles
 *  - Scroll-reveal (IntersectionObserver)
 *  - Live countdown to 2026-12-07 17:30 IST
 *  - Fixed ambient audio toggle (procedural, zero dependency)
 *  - RSVP confirmation + image zoom modal
 */
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const DEVANAGARI = ['०','१','२','३','४','५','६','७','८','९'];
    const toDev = (n) => n.toString().padStart(2, '0').split('').map(c => DEVANAGARI[+c] ?? c).join('');

    const $ = (id) => document.getElementById(id);

    // -------------------------------------------------------------------------
    // 1. GOLDEN DUST PARTICLE CANVAS
    // -------------------------------------------------------------------------
    class ParticleEngine {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.count = window.innerWidth < 768 ? 28 : 50;
            this.resize();
            this.init();
            this.animate = this.animate.bind(this);
            window.addEventListener('resize', () => this.resize());
        }
        resize() { this.w = this.canvas.width = window.innerWidth; this.h = this.canvas.height = window.innerHeight; }
        init() {
            this.particles = [];
            for (let i = 0; i < this.count; i++) {
                this.particles.push({
                    x: Math.random() * this.w, y: Math.random() * this.h,
                    r: Math.random() * 1.8 + 0.5,
                    sy: Math.random() * 0.4 + 0.12, sx: (Math.random() - 0.5) * 0.3,
                    a: Math.random() * 0.5 + 0.2
                });
            }
        }
        start() { if (!this.id) this.animate(); }
        animate() {
            this.ctx.clearRect(0, 0, this.w, this.h);
            for (const p of this.particles) {
                p.y -= p.sy; p.x += Math.sin(p.y * 0.02) * 0.3 + p.sx;
                if (p.y < -10) { p.y = this.h + 10; p.x = Math.random() * this.w; }
                if (p.x < -10) p.x = this.w + 10; if (p.x > this.w + 10) p.x = -10;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(201, 162, 74, ${p.a})`;
                this.ctx.fill();
            }
            this.id = requestAnimationFrame(this.animate);
        }
    }
    const canvas = $('particleCanvas');
    if (canvas) new ParticleEngine(canvas).start();

    // -------------------------------------------------------------------------
    // 2. FLOATING PETALS (themed: gold / saffron / marigold / deep red)
    // -------------------------------------------------------------------------
    (function buildPetals() {
        const layer = $('petalLayer');
        if (!layer) return;
        const colors = ['#D98C3A', '#C9631F', '#E0A94B', '#9E2B1E', '#D1591C', '#E6CD86'];
        const count = window.innerWidth < 768 ? 16 : 26;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'petal';
            const size = 7 + Math.random() * 11;
            p.style.width = size + 'px';
            p.style.height = (size * 0.7) + 'px';
            p.style.left = (Math.random() * 100) + 'vw';
            p.style.background = colors[(Math.random() * colors.length) | 0];
            p.style.setProperty('--drift', (Math.random() * 160 - 80) + 'px');
            const dur = 10 + Math.random() * 12;
            p.style.animationDuration = dur + 's';
            p.style.animationDelay = (-Math.random() * dur) + 's';
            layer.appendChild(p);
        }
    })();

    // -------------------------------------------------------------------------
    // 3. PROCEDURAL AMBIENT AUDIO ENGINE
    // -------------------------------------------------------------------------
    class AudioEngine {
        constructor() { this.ctx = null; this.gain = null; this.playing = false; this.nodes = []; }
        ensure() {
            if (!this.ctx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (AC) this.ctx = new AC();
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        }
        chime() {
            this.ensure(); if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [528, 792, 1056].forEach((f, i) => {
                const o = this.ctx.createOscillator(), g = this.ctx.createGain();
                o.type = 'sine'; o.frequency.setValueAtTime(f, now + 0.04);
                g.gain.setValueAtTime(0.3 / (i + 1), now + 0.04);
                g.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
                o.connect(g); g.connect(this.ctx.destination); o.start(now + 0.04); o.stop(now + 2.6);
            });
        }
        startAmbient() {
            this.ensure(); if (!this.ctx || this.playing) return;
            this.gain = this.ctx.createGain();
            this.gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
            this.gain.gain.linearRampToValueAtTime(0.06, this.ctx.currentTime + 2.5);
            this.gain.connect(this.ctx.destination);
            [108, 162, 216].forEach(f => {
                const o = this.ctx.createOscillator();
                o.type = 'triangle'; o.frequency.setValueAtTime(f, this.ctx.currentTime);
                o.connect(this.gain); o.start(); this.nodes.push(o);
            });
            this.playing = true;
        }
        stopAmbient() {
            if (!this.ctx || !this.playing) return;
            try {
                this.gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);
                this.nodes.forEach(o => { try { o.stop(this.ctx.currentTime + 0.5); } catch (e) {} });
            } catch (e) {}
            this.nodes = []; this.playing = false;
        }
    }
    const audio = new AudioEngine();

    // Background music (uploaded track) — the real soundtrack of the page
    const bgAudio = $('bgAudio');
    if (bgAudio) bgAudio.volume = 0.6;
    function playMusic() {
        if (!bgAudio) return;
        const pr = bgAudio.play();
        if (pr && pr.catch) pr.catch(() => setAudioIcon(false));
        setAudioIcon(true);
    }
    function pauseMusic() {
        if (bgAudio) bgAudio.pause();
        setAudioIcon(false);
    }

    // -------------------------------------------------------------------------
    // 4. OPENER → BURST → (VIDEO) → MAIN
    // -------------------------------------------------------------------------
    const opener     = $('opener');
    const openerCard = $('openerCard');
    const revealBtn  = $('openerRevealBtn');
    const burst      = $('burst');
    const videoOverlay = $('videoOverlay');
    const introVideo = $('introVideo');
    const skipVideoBtn = $('skipVideoBtn');
    const main       = $('main');

    let opened = false;

    function showMain() {
        main.setAttribute('aria-hidden', 'false');
        document.body.classList.remove('preload');
        // Trigger reveals already in view
        requestAnimationFrame(() => runRevealCheck());
    }

    function endVideo() {
        if (videoOverlay.classList.contains('hidden')) return;
        try { introVideo.pause(); } catch (e) {}
        videoOverlay.classList.add('hidden');
        videoOverlay.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
        playMusic();
        showMain();
    }

    function playIntroVideo() {
        // Only attempt if a <source> can load; otherwise go straight to main
        videoOverlay.classList.remove('hidden');
        videoOverlay.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflow = 'hidden';
        introVideo.muted = false;
        introVideo.volume = 1.0;
        const p = introVideo.play();
        if (p && p.catch) {
            p.catch(() => { introVideo.muted = true; introVideo.play().catch(() => endVideo()); });
        }
        introVideo.addEventListener('ended', endVideo, { once: true });
        introVideo.addEventListener('error', endVideo, { once: true });
        // Safety: if metadata never loads within 1.2s, skip
        setTimeout(() => {
            if (!introVideo.duration || isNaN(introVideo.duration)) endVideo();
        }, 1500);
    }

    function openInvitation(withVideo) {
        if (opened) return;
        opened = true;
        audio.ensure();
        audio.chime();

        // Prime the music track within this user gesture so it can autoplay later
        if (bgAudio) {
            bgAudio.muted = true;
            const pp = bgAudio.play();
            if (pp && pp.then) pp.then(() => { bgAudio.pause(); bgAudio.currentTime = 0; bgAudio.muted = false; })
                                 .catch(() => { bgAudio.muted = false; });
        }

        burst.classList.add('fire');
        setTimeout(() => {
            opener.classList.add('gone');
            if (withVideo) {
                playIntroVideo();
            } else {
                document.documentElement.style.overflow = '';
                playMusic();
                showMain();
            }
            setTimeout(() => { opener.style.display = 'none'; }, 850);
        }, 650);
    }

    // Reveal → play the intro video (keeps the cinematic asset), then scroll page
    const triggerOpen = () => openInvitation(true);
    if (openerCard) {
        openerCard.addEventListener('click', triggerOpen);
        openerCard.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerOpen(); } });
    }
    if (revealBtn) revealBtn.addEventListener('click', triggerOpen);
    if (skipVideoBtn) skipVideoBtn.addEventListener('click', endVideo);

    // -------------------------------------------------------------------------
    // 5. SCROLL REVEAL
    // -------------------------------------------------------------------------
    const revealEls = Array.from(document.querySelectorAll('.reveal'));
    let io = null;
    if ('IntersectionObserver' in window) {
        io = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
        }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('in'));
    }
    function runRevealCheck() {
        // Ensure anything already on-screen after open becomes visible
        revealEls.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.92) el.classList.add('in');
        });
    }

    // -------------------------------------------------------------------------
    // 6. COUNTDOWN  →  Mon 7 Dec 2026, 5:30 PM IST (UTC+05:30)
    // -------------------------------------------------------------------------
    const target = new Date('2026-12-07T17:30:00+05:30').getTime();
    const elDays = $('cdDays'), elHours = $('cdHours'), elMins = $('cdMins'), elSecs = $('cdSecs');
    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
            [elDays, elHours, elMins, elSecs].forEach(el => el && (el.textContent = '००'));
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor(diff / 3600000) % 24;
        const m = Math.floor(diff / 60000) % 60;
        const s = Math.floor(diff / 1000) % 60;
        if (elDays)  elDays.textContent  = toDev(d);
        if (elHours) elHours.textContent = toDev(h);
        if (elMins)  elMins.textContent  = toDev(m);
        if (elSecs)  elSecs.textContent  = toDev(s);
    }
    tick(); setInterval(tick, 1000);

    // -------------------------------------------------------------------------
    // 7. AUDIO TOGGLE
    // -------------------------------------------------------------------------
    const audioToggle = $('audioToggle');
    const iconOn = audioToggle ? audioToggle.querySelector('.icon-on') : null;
    const iconOff = audioToggle ? audioToggle.querySelector('.icon-off') : null;
    function setAudioIcon(on) {
        if (!iconOn || !iconOff) return;
        iconOn.classList.toggle('hidden', !on);
        iconOff.classList.toggle('hidden', on);
    }
    setAudioIcon(false);
    if (audioToggle) {
        audioToggle.addEventListener('click', () => {
            if (bgAudio && !bgAudio.paused) { pauseMusic(); }
            else { playMusic(); }
        });
    }

    // -------------------------------------------------------------------------
    // 8. IMAGE ZOOM MODAL
    // -------------------------------------------------------------------------
    const banner = $('fortsBanner');
    const modal = $('imageModal');
    const closeModal = $('closeModalBtn');
    const modalBackdrop = $('modalBackdrop');
    function openModal() { if (modal) { modal.classList.remove('hidden'); modal.setAttribute('aria-hidden', 'false'); } }
    function hideModal() { if (modal) { modal.classList.add('hidden'); modal.setAttribute('aria-hidden', 'true'); } }
    if (banner) banner.addEventListener('click', openModal);
    if (closeModal) closeModal.addEventListener('click', hideModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', hideModal);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideModal(); });

    // -------------------------------------------------------------------------
    // 9. ROYAL SCHEDULE SCROLL — auto-unrolls on scroll-down, rolls up on scroll-up
    // -------------------------------------------------------------------------
    const royalScroll = $('royalScroll');
    if (royalScroll) {
        const openScroll = () => {
            if (royalScroll.classList.contains('open')) return;
            royalScroll.classList.add('open');
            royalScroll.setAttribute('aria-expanded', 'true');
            try { audio.chime(); } catch (e) {}
        };
        const closeScroll = () => {
            if (!royalScroll.classList.contains('open')) return;
            royalScroll.classList.remove('open');
            royalScroll.setAttribute('aria-expanded', 'false');
        };

        // Open as it scrolls into view (going down); roll back up when scrolling up past it.
        // Hysteresis (open at 0.62, close at 0.86 of viewport height) prevents flicker.
        let lastY = window.pageYOffset || 0, scheduled = false;
        const check = () => {
            scheduled = false;
            const y = window.pageYOffset || 0;
            const goingDown = y > lastY;
            lastY = y;
            const rect = royalScroll.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const isOpen = royalScroll.classList.contains('open');
            if (goingDown && !isOpen && rect.top < vh * 0.62 && rect.bottom > vh * 0.15) {
                openScroll();
            } else if (!goingDown && isOpen && rect.top > vh * 0.86) {
                closeScroll();
            }
        };
        window.addEventListener('scroll', () => {
            if (!scheduled) { scheduled = true; requestAnimationFrame(check); }
        }, { passive: true });

        // Manual fallback: tapping the sealed scroll also opens it
        royalScroll.addEventListener('click', (e) => {
            if (royalScroll.classList.contains('open')) return;
            if (e.target.closest('a, button')) return;
            openScroll();
        });
        royalScroll.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !royalScroll.classList.contains('open')) {
                e.preventDefault(); openScroll();
            }
        });
    }

    // -------------------------------------------------------------------------
    // 9b. SCROLL PROGRESS BAR (animation while scrolling)
    // -------------------------------------------------------------------------
    const progressBar = $('scrollProgress');
    if (progressBar) {
        let ticking = false;
        const updateProgress = () => {
            const h = document.documentElement;
            const max = (h.scrollHeight - h.clientHeight) || 1;
            const top = h.scrollTop || document.body.scrollTop || 0;
            progressBar.style.width = Math.min(100, Math.max(0, top / max * 100)) + '%';
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
        }, { passive: true });
        updateProgress();
    }

    // -------------------------------------------------------------------------
    // 10. REPLAY
    // -------------------------------------------------------------------------
    const replayBtn = $('replayBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            opened = false;
            opener.style.display = '';
            opener.classList.remove('gone');
            burst.classList.remove('fire');
            main.setAttribute('aria-hidden', 'true');
            try { introVideo.currentTime = 0; } catch (e) {}
        });
    }
});
