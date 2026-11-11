/* =====================================================
   STUDENT PORTFOLIO - UNIVERSE EDITION - script.js
   Each part below does one job. Read the comments!

   SAFETY: every part runs inside safely(...). If one part has
   a problem, the other parts still work, and your content never
   stays hidden.
   ===================================================== */

(function () {

    // Tell the CSS that JavaScript is working (the scroll animation and mobile menu need it).
    // If this file fails to load, this line never runs, so all sections stay visible.
    document.documentElement.classList.add('js-ready');

    // Runs a part of the code and shows a clear message in the Console (F12) if it breaks
    function safely(name, task) {
        try {
            task();
        } catch (error) {
            console.error('Portfolio: the part "' + name + '" has a problem:', error);
        }
    }

    function onReady(task) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', task);
        } else {
            task();
        }
    }

    onReady(function () {

        /* ---------- TOAST MESSAGE (small box at the bottom) ---------- */
        var toast = document.getElementById('toast');
        var toastTimer;

        function showToast(text, seconds) {
            if (!toast) { return; }
            toast.textContent = text;
            toast.classList.add('show');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () { toast.classList.remove('show'); }, (seconds || 3.5) * 1000);
        }

        /* ---------- 1. FOOTER YEAR ---------- */
        safely('footer year', function () {
            var yearSpan = document.getElementById('year');
            if (yearSpan) { yearSpan.textContent = new Date().getFullYear(); }
        });

        /* ---------- 2. MOBILE MENU ---------- */
        safely('mobile menu', function () {
            var navToggle = document.getElementById('navToggle');
            var navMenu = document.getElementById('navMenu');
            if (!navToggle || !navMenu) { return; }

            function closeMenu() {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.setAttribute('aria-label', 'Open menu');
            }

            navToggle.addEventListener('click', function () {
                var isOpen = navMenu.classList.toggle('open');
                navToggle.setAttribute('aria-expanded', String(isOpen));
                navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            });

            // Close the menu after clicking a link
            navMenu.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', closeMenu);
            });
        });

        /* ---------- 3. MISSING IMAGE FALLBACK ----------
           If an image file is not found, show a readable box instead. */
        safely('image fallback', function () {
            function showPlaceholder(img) {
                var box = document.createElement('div');
                box.className = 'img-placeholder';
                box.setAttribute('role', 'img');
                box.setAttribute('aria-label', img.alt);
                box.textContent = img.dataset.placeholder || 'Image not found';
                img.replaceWith(box);
            }

            document.querySelectorAll('img[data-placeholder]').forEach(function (img) {
                // The image may already have failed before this code ran
                if (img.complete && img.naturalWidth === 0) {
                    showPlaceholder(img);
                } else {
                    img.addEventListener('error', function () { showPlaceholder(img); });
                }
            });
        });

        /* ---------- 4. PLACEHOLDER LINKS ----------
           Links with class "is-placeholder" do not go anywhere yet.
           Clicking one tells the visitor (and you) to add a real link. */
        safely('placeholder links', function () {
            document.querySelectorAll('a.is-placeholder').forEach(function (link) {
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    showToast('This link is a placeholder. Open index.html and add your real link.');
                });
            });
        });

        /* ---------- 5. IMAGE PREVIEW (MODAL) ---------- */
        safely('image preview', function () {
            var modal = document.getElementById('imageModal');
            var modalImage = document.getElementById('modalImage');
            var modalCaption = document.getElementById('modalCaption');
            var modalMissing = document.getElementById('modalMissing');
            var modalClose = document.getElementById('modalClose');
            var lastFocused = null;
            if (!modal || !modalImage) { return; }

            function openModal(src, caption) {
                lastFocused = document.activeElement;
                modalMissing.hidden = true;
                modalImage.hidden = false;
                modalImage.alt = caption;
                modalImage.src = src;
                modalCaption.textContent = caption;
                modal.hidden = false;
                document.body.style.overflow = 'hidden';
                modalClose.focus();
            }

            function closeModal() {
                modal.hidden = true;
                modalImage.removeAttribute('src');
                document.body.style.overflow = '';
                if (lastFocused) { lastFocused.focus(); }
            }

            // If the big image is missing, show a friendly message
            modalImage.addEventListener('error', function () {
                if (modalImage.getAttribute('src')) {
                    modalImage.hidden = true;
                    modalMissing.hidden = false;
                }
            });

            document.querySelectorAll('.cert-thumb').forEach(function (button) {
                button.addEventListener('click', function () {
                    openModal(button.dataset.full, button.dataset.caption || 'Certificate');
                });
            });

            modalClose.addEventListener('click', closeModal);
            // Click on the dark background closes it too
            modal.addEventListener('click', function (event) {
                if (event.target === modal) { closeModal(); }
            });
            // Press Esc to close
            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && !modal.hidden) { closeModal(); }
            });
        });

        /* ---------- 6. SCROLL ANIMATIONS (Intersection Observer) ----------
           Adds the class "visible" when an element enters the screen.
           If anything goes wrong, everything is shown right away. */
        var revealItems = document.querySelectorAll('.reveal');

        function showAllRevealItems() {
            revealItems.forEach(function (item) { item.classList.add('visible'); });
        }

        try {
            if ('IntersectionObserver' in window) {
                var revealObserver = new IntersectionObserver(function (entries, observer) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            observer.unobserve(entry.target); // animate only once
                        }
                    });
                }, { threshold: 0.05 });

                revealItems.forEach(function (item) { revealObserver.observe(item); });
            } else {
                showAllRevealItems();
            }
        } catch (error) {
            console.error('Portfolio: scroll animation problem, showing everything:', error);
            showAllRevealItems();
        }

        /* ---------- 7. MENU: HOVER, ACTIVE LINK AND CLICK FEEDBACK ----------
           - Hover: a small label shows what the menu button does (from data-tip).
           - Active: the menu button of the section you are looking at is highlighted.
           - Click: the menu button lights up, the section title flashes,
             and a message says "Now viewing: ...". */
        var navLinks = document.querySelectorAll('.nav-link');
        var menuLockUntil = 0; // while scrolling after a click, do not let the scroll change the highlight

        function setActiveLink(id) {
            navLinks.forEach(function (link) {
                var isActive = link.getAttribute('href') === '#' + id;
                link.classList.toggle('active', isActive);
                if (isActive) {
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.removeAttribute('aria-current');
                }
            });
        }

        function flashSection(id) {
            var section = document.getElementById(id);
            if (!section) { return; }
            section.classList.remove('section-flash');
            void section.offsetWidth; // restart the animation
            section.classList.add('section-flash');
            setTimeout(function () { section.classList.remove('section-flash'); }, 1500);
        }

        safely('menu click feedback', function () {
            navLinks.forEach(function (link) {
                link.addEventListener('click', function () {
                    var id = link.getAttribute('href').replace('#', '');
                    setActiveLink(id);
                    menuLockUntil = Date.now() + 1300;
                    showToast('Now viewing: ' + link.textContent.trim(), 2);
                    setTimeout(function () { flashSection(id); }, 450);
                });
            });
        });

        safely('active menu link', function () {
            var sections = document.querySelectorAll('main section[id]');
            if (!('IntersectionObserver' in window)) { return; }

            var sectionObserver = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && Date.now() > menuLockUntil) {
                        setActiveLink(entry.target.id);
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });

            sections.forEach(function (section) { sectionObserver.observe(section); });
        });

        /* ---------- 8. BACK TO TOP BUTTON (and "Contact" at the very bottom) ---------- */
        safely('back to top', function () {
            var backToTop = document.getElementById('backToTop');
            if (!backToTop) { return; }

            window.addEventListener('scroll', function () {
                backToTop.classList.toggle('show', window.scrollY > 500);

                // The Contact section is short, so highlight it when the page reaches the bottom
                var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
                if (atBottom && Date.now() > menuLockUntil) { setActiveLink('contact'); }
            }, { passive: true });

            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        /* ---------- 9. CONTACT FORM VALIDATION ----------
           NOTE: This form does NOT send messages by itself, because a website
           with only HTML/CSS/JS has no server (backend).
           After the fields are valid, we make an email link so the visitor can
           send the message using their own email app.
           To really send messages, see "Connect the form later" in GUIDE.md. */
        safely('contact form', function () {
            var form = document.getElementById('contactForm');
            var formStatus = document.getElementById('formStatus');
            var nameInput = document.getElementById('name');
            var emailInput = document.getElementById('email');
            var messageInput = document.getElementById('message');
            if (!form) { return; }

            form.noValidate = true; // we show our own messages instead of the browser's

            function setError(input, errorId, text) {
                document.getElementById(errorId).textContent = text;
                input.classList.toggle('invalid', text !== '');
                input.setAttribute('aria-invalid', text !== '' ? 'true' : 'false');
            }

            function validateForm() {
                var valid = true;
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (nameInput.value.trim() === '') {
                    setError(nameInput, 'nameError', 'Please enter your name.');
                    valid = false;
                } else {
                    setError(nameInput, 'nameError', '');
                }

                if (emailInput.value.trim() === '') {
                    setError(emailInput, 'emailError', 'Please enter your email address.');
                    valid = false;
                } else if (!emailPattern.test(emailInput.value.trim())) {
                    setError(emailInput, 'emailError', 'Please enter a valid email, like name@example.com.');
                    valid = false;
                } else {
                    setError(emailInput, 'emailError', '');
                }

                if (messageInput.value.trim().length < 10) {
                    setError(messageInput, 'messageError', 'Please write a message (at least 10 characters).');
                    valid = false;
                } else {
                    setError(messageInput, 'messageError', '');
                }

                return valid;
            }

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                formStatus.className = 'form-status';
                formStatus.innerHTML = '';

                if (!validateForm()) {
                    formStatus.className = 'form-status fail';
                    formStatus.textContent = 'Please fix the problems above and try again.';
                    return;
                }

                // Build an email link using the address written in the Contact section
                var myEmail = document.getElementById('myEmail').getAttribute('href').replace('mailto:', '');
                var subject = encodeURIComponent('Portfolio message from ' + nameInput.value.trim());
                var body = encodeURIComponent(messageInput.value.trim() + '\n\nFrom: ' + nameInput.value.trim() + ' (' + emailInput.value.trim() + ')');
                var mailLink = 'mailto:' + myEmail + '?subject=' + subject + '&body=' + body;

                formStatus.className = 'form-status success';
                formStatus.innerHTML =
                    'Thank you! Your message looks good. This website has no server yet, so the message was <strong>not sent automatically</strong>. ' +
                    '<a href="' + mailLink + '">Click here to send it with your email app</a>.';
            });

            // Remove the red error as soon as the visitor fixes a field
            [nameInput, emailInput, messageInput].forEach(function (input) {
                input.addEventListener('input', function () {
                    if (input.classList.contains('invalid')) { validateForm(); }
                });
            });
        });

        /* ---------- 10. UNIVERSE BACKGROUND ----------
           Draws the moving universe on the <canvas id="universe">:
             - stars on different depths (near stars move faster = 3D feeling)
             - stars stretch into little streaks when you scroll fast
             - a glowing hologram planet with a ring that turns as you scroll
             - an occasional shooting star
           It also sets the CSS variable --scroll so the clouds and the grid
           in style.css move with your scrolling.
           If a visitor chose "reduce motion", the universe is drawn once and stays still. */
        safely('universe background', function () {
            var canvas = document.getElementById('universe');
            if (!canvas || !canvas.getContext) { return; }

            var ctx = canvas.getContext('2d');
            var root = document.documentElement;
            var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            var viewWidth = 0;
            var viewHeight = 0;
            var stars = [];
            var starColors = ['#ffffff', '#a5f3fc', '#c4b5fd', '#f9a8d4'];

            var targetScroll = window.scrollY;  // where the page really is
            var smoothScroll = window.scrollY;  // a softer copy that "catches up" (smooth motion)
            var lastScroll = window.scrollY;
            var time = 0;
            var animationId = null;
            var shootingStar = null;
            var nextShootingStar = 4000;        // milliseconds

            // Make the canvas fit the screen and create the stars
            function buildUniverse() {
                var ratio = Math.min(window.devicePixelRatio || 1, 2); // sharp but not too heavy
                viewWidth = window.innerWidth;
                viewHeight = window.innerHeight;
                canvas.width = Math.round(viewWidth * ratio);
                canvas.height = Math.round(viewHeight * ratio);
                ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

                // Change 260 to a smaller number (like 120) if your computer feels slow
                var count = Math.min(260, Math.round((viewWidth * viewHeight) / 6500));
                stars = [];
                for (var i = 0; i < count; i++) {
                    stars.push({
                        x: Math.random() * viewWidth,
                        y: Math.random() * viewHeight,
                        depth: 0.15 + Math.random() * 0.85,   // small = far away, big = close
                        color: starColors[Math.floor(Math.random() * starColors.length)],
                        phase: Math.random() * Math.PI * 2    // makes each star twinkle differently
                    });
                }
            }

            function drawStars(velocity) {
                stars.forEach(function (star) {
                    // Close stars (big depth) move more when you scroll
                    var y = ((star.y - smoothScroll * star.depth * 0.6) % viewHeight + viewHeight) % viewHeight;
                    var x = star.x + Math.sin(time * 0.0006 + star.phase) * 5 * star.depth + smoothScroll * 0.02 * star.depth;
                    x = ((x % viewWidth) + viewWidth) % viewWidth;

                    var size = 0.5 + star.depth * 1.7;
                    var twinkle = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(time * 0.003 + star.phase);
                    ctx.globalAlpha = Math.min(1, (0.45 + star.depth * 0.55) * twinkle);
                    ctx.fillStyle = star.color;
                    ctx.strokeStyle = star.color;

                    // Streak: a short tail behind the star while you scroll fast
                    var streak = Math.min(Math.abs(velocity) * star.depth * 1.4, 46);
                    if (streak > 2) {
                        ctx.lineWidth = size;
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x, y + (velocity > 0 ? streak : -streak));
                        ctx.stroke();
                    }

                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // The glowing wireframe planet (hologram)
            function drawHologramPlanet() {
                var radius = Math.min(viewWidth, viewHeight) * (viewWidth < 700 ? 0.17 : 0.2);
                // The planet floats around a little while you scroll
                var centerX = viewWidth * 0.78 + Math.cos(smoothScroll * 0.0016) * viewWidth * 0.07;
                var centerY = viewHeight * 0.34 + Math.sin(smoothScroll * 0.0022) * viewHeight * 0.14;
                var spin = time * 0.0004 + smoothScroll * 0.004;   // turns by itself and when you scroll
                var tilt = -0.35;
                var i;

                ctx.lineWidth = 1.2;
                ctx.strokeStyle = '#22d3ee';
                ctx.globalAlpha = 0.4;

                // Outer circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();

                // Lines from top to bottom (they rotate)
                for (i = 0; i < 6; i++) {
                    var angle = spin + (i * Math.PI) / 6;
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, Math.abs(Math.cos(angle)) * radius, radius, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Lines from left to right
                for (var lat = -60; lat <= 60; lat += 30) {
                    var rad = (lat * Math.PI) / 180;
                    var ringWidth = Math.cos(rad) * radius;
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY + Math.sin(rad) * radius, ringWidth, ringWidth * 0.22, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Two tilted rings
                ctx.strokeStyle = '#a78bfa';
                ctx.lineWidth = 1.8;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.7, radius * 0.45, tilt, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.ellipse(centerX, centerY, radius * 1.95, radius * 0.55, tilt, 0, Math.PI * 2);
                ctx.stroke();

                // A small moon that travels around the first ring
                var orbit = time * 0.001 + smoothScroll * 0.003;
                var a = radius * 1.7;
                var b = radius * 0.45;
                var moonX = centerX + a * Math.cos(orbit) * Math.cos(tilt) - b * Math.sin(orbit) * Math.sin(tilt);
                var moonY = centerY + a * Math.cos(orbit) * Math.sin(tilt) + b * Math.sin(orbit) * Math.cos(tilt);
                ctx.globalAlpha = 0.95;
                ctx.fillStyle = '#f9a8d4';
                ctx.beginPath();
                ctx.arc(moonX, moonY, 3.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;
            }

            // A shooting star now and then
            function drawShootingStar() {
                if (!shootingStar && time > nextShootingStar) {
                    shootingStar = { x: viewWidth * (0.4 + Math.random() * 0.6), y: Math.random() * viewHeight * 0.3, life: 0 };
                }
                if (shootingStar) {
                    shootingStar.x -= 14;
                    shootingStar.y += 7;
                    shootingStar.life += 1;
                    ctx.globalAlpha = Math.max(0, 1 - shootingStar.life / 50);
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(shootingStar.x, shootingStar.y);
                    ctx.lineTo(shootingStar.x + 84, shootingStar.y - 42);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    if (shootingStar.life >= 50) {
                        shootingStar = null;
                        nextShootingStar = time + 5000 + Math.random() * 7000;
                    }
                }
            }

            function drawUniverse(timestamp) {
                time = timestamp || 0;
                smoothScroll += (targetScroll - smoothScroll) * 0.08;
                var velocity = smoothScroll - lastScroll;   // how fast you are scrolling
                lastScroll = smoothScroll;

                ctx.clearRect(0, 0, viewWidth, viewHeight);
                drawStars(velocity);
                drawHologramPlanet();
                if (!reduceMotion) { drawShootingStar(); }

                root.style.setProperty('--scroll', smoothScroll.toFixed(1));

                if (!reduceMotion && !document.hidden) {
                    animationId = requestAnimationFrame(drawUniverse);
                }
            }

            buildUniverse();

            if (reduceMotion) {
                // Draw one still picture and keep the page calm
                drawUniverse(0);
                window.addEventListener('resize', function () { buildUniverse(); drawUniverse(0); });
            } else {
                window.addEventListener('scroll', function () { targetScroll = window.scrollY; }, { passive: true });
                window.addEventListener('resize', buildUniverse);
                // Pause when the tab is hidden (saves battery), continue when it comes back
                document.addEventListener('visibilitychange', function () {
                    if (document.hidden) {
                        cancelAnimationFrame(animationId);
                    } else {
                        animationId = requestAnimationFrame(drawUniverse);
                    }
                });
                animationId = requestAnimationFrame(drawUniverse);
            }
        });

    });

})();