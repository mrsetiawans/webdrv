// --- VALIDATION LOGIC ---
    const operatorPrefixes = {
        'Telkomsel': ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'],
        'by.U': ['0851'],
        'Indosat Ooredoo': ['0814', '0815', '0816', '0855', '0856', '0857', '0858'],
        'Tri (3)': ['0895', '0896', '0897', '0898', '0899'],
        'XL Axiata': ['0817', '0818', '0819', '0859', '0877', '0878', '0879'],
        'Live.On': ['0859'],
        'Axis': ['0831', '0832', '0833', '0838'],
        'Smartfren': ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889']
    };
    const blacklistedNumbers = ['081234567890'];

    function isInvalidPattern(nomor) {
        if (blacklistedNumbers.includes(nomor)) return true;
        const numberPart = nomor.substring(2);
        if (/(\d)\1{4,}/.test(numberPart)) return true;
        for (let i = 0; i < numberPart.length - 4; i++) {
            const sub = numberPart.substring(i, i + 5);
            const isAscending = '0123456789'.includes(sub);
            const isDescending = '9876543210'.includes(sub);
            if (isAscending || isDescending) return true;
        }
        const uniqueDigits = new Set(numberPart.split(''));
        if (uniqueDigits.size < 4) return true;
        if (/(..)\1\1/.test(numberPart)) return true;
        return false;
    }

    function getOperatorFromNumber(nomor) {
        const prefix = nomor.substring(0, 4);
        for (const operator in operatorPrefixes) {
            if (operatorPrefixes[operator].includes(prefix)) {
                return operator;
            }
        }
        return null;
    }

    function validatePhoneNumber(nomorHp) {
        const genericError = { isValid: false, message: 'Silahkan isi dengan nomor yang benar' };

        if (nomorHp.length < 10) {
            return genericError;
        }

        const operator = getOperatorFromNumber(nomorHp);
        if (!operator) {
            return genericError;
        }

        const maxLength = operator === 'Tri (3)' ? 13 : 12;
        if (nomorHp.length > maxLength) {
            return genericError;
        }

        if (isInvalidPattern(nomorHp)) {
            return genericError;
        }

        return { isValid: true, message: 'Nomor valid.' };
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    document.addEventListener('DOMContentLoaded', function() {
        // --- ELEMENTS ---
        const elements = {
            mainContentContainer: document.getElementById('main-content-container'),
            paymentInstructionContainer: document.getElementById('payment-instruction-container'),
            footer: document.getElementById('footer'),
            currentYear: document.getElementById('currentYear'),
            packageSelectionRadios: document.querySelectorAll('input[name="package"]'),
            productInfoFormTop: document.getElementById('product-info-form-top'),
            detailsAccordionContainer: document.getElementById('details-accordion-container'),
            paymentMethodSelection: document.getElementById('payment-method-selection'),
            orderDetailsInForm: document.getElementById('order-details-in-form'),
            testimonialsFull: document.getElementById('testimonials-full'),
            infoSectionFull: document.getElementById('info-section-full'),
            orderForm: document.getElementById('orderForm'),
            submitBtn: document.getElementById('submit-btn'),
            notifBox: document.getElementById('notifBox'),
            notifName: document.querySelector('#notifBox .notif-name'),
            detailsModal: document.getElementById('detailsModal'),
            detailsModalContent: document.getElementById('detailsModalContent'),
        };

        // --- CONFIGURATION ---
        const uniqueCode = Math.floor(Math.random() * (500 - 100 + 1)) + 100;
        let countdownInterval;
        let expiryTime;
        let currentOrderDetails = {};

        const packages = {
            yearly: {
                id: 'yearly',
                name: "Adobe Creative Cloud (1 Tahun)",
                price: 350000,
                normalPrice: 500000,
                title: "Adobe Creative Cloud",
                durationText: "Berlaku 1 Tahun / 5 Devices",
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Adobe_Creative_Cloud_rainbow_icon.svg/240px-Adobe_Creative_Cloud_rainbow_icon.svg.png',
                description: "Akses semua aplikasi Adobe & 100GB Cloud Storage.",
                features: [
                    "<strong>Akses 20+ Aplikasi Adobe:</strong> Termasuk Photoshop, Illustrator, Premiere Pro, After Effects, InDesign, dll.",
                    "<strong>Penyimpanan Cloud 100GB:</strong> Simpan dan sinkronkan file Anda dengan mudah.",
                    "<strong>Sinkronisasi Antar Perangkat:</strong> Bekerja mulus di desktop, mobile, dan web.",
                    "<strong>Creative Cloud Libraries:</strong> Bagikan aset dan warna antar aplikasi dengan tim Anda.",
                    "<strong>Ribuan Font Premium:</strong> Akses koleksi font lengkap dari Adobe Fonts.",
                    "<strong>Integrasi Adobe Stock:</strong> Temukan jutaan aset foto, video, dan vektor langsung di aplikasi.",
                    "<strong>Pembaruan Otomatis:</strong> Selalu dapatkan fitur terbaru tanpa biaya tambahan.",
                    "<strong>Integrasi Lintas Aplikasi:</strong> Alur kerja yang lancar, misalnya dari Illustrator ke After Effects.",
                    "<strong>Template & Aset Gratis:</strong> Percepat proyek Anda dengan ribuan template siap pakai.",
                    "<strong>Aplikasi Mobile & Web:</strong> Edit di mana saja dengan Photoshop Express, Premiere Rush, dan lainnya.",
                    "<strong>Fitur AI Generatif:</strong> Manfaatkan kekuatan Adobe Firefly untuk generative fill, text-to-image, dll.",
                    "<strong>Adobe Portfolio & Behance:</strong> Bangun situs portofolio profesional dan tampilkan karya Anda.",
                    "<strong>Akses Offline:</strong> Tetap produktif bahkan saat tidak terhubung ke internet.",
                    "<strong>Keamanan Terenkripsi:</strong> File Anda aman di penyimpanan cloud Adobe.",
                    "<strong>Pusat Bantuan Resmi:</strong> Dapatkan akses ke tutorial, panduan, dan dukungan dari Adobe."
                ],
                testimonials: testimonials
            }
        };

        let currentPackageId = 'yearly'; // Paket default yang dipilih

        // --- PAYMENT ACCOUNTS ---
        const paymentAccounts = {
            qris: {
                displayName: 'QRIS',
                accountHolder: 'Epay',
                number: '00020101021126610016ID.CO.SHOPEE.WWW01189360091800223157700208223157700303UMI51440014ID.CO.QRIS.WWW0215ID10254270621910303UMI5204481453033605802ID5904Epay6013JAKARTA PUSAT61051061062070703A0163042F15',
                logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_QRIS.svg/163px-Logo_QRIS.svg.png',
                type: 'qris',
            },
            cimb: {
                 displayName: 'Cimb Niaga',
                accountHolder: 'Octo Pay - 6289510639366',
                 number: '6289510639366',
                 logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/CIMB_Niaga_logo.svg/330px-CIMB_Niaga_logo.svg.png',
                 type: 'va',
            },
            bca_va: {
                 displayName: 'BCA Virtual Account',
                 accountHolder: 'Epayment',
                 number: '39358089510639366',
                 logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/330px-Bank_Central_Asia.svg.png',
                 type: 'va',
            },
            gopay: {
                 displayName: 'Gopay',
                 accountHolder: 'Gopay 6289510639366',
                 number: '089510639366',
                 logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/320px-Gopay_logo.svg.png',
                 type: 'ewallet',
            },
            dana: {
                 displayName: 'DANA',
                 accountHolder: 'DNID089510639366',
                 number: '089510639366',
                 logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Logo_dana_blue.svg/330px-Logo_dana_blue.svg.png',
                 type: 'ewallet',
            },
            ovo: {
                 displayName: 'OVO',
                 accountHolder: 'OVO Epayment',
                 number: '089510639366',
                 logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/330px-Logo_ovo_purple.svg.png',
                 type: 'ewallet',
            }
        };

        // --- TEMPLATE FUNCTIONS ---
        const getProductInfoHTML = (pkg) => {
            const discount = Math.round(((pkg.normalPrice - pkg.price) / pkg.normalPrice) * 100);
            return `
            <div class="product-info-card flex h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <!-- Left Stripe -->
                <div class="w-2 bg-gradient-to-b from-[#007aff] to-[#005ecb]"></div>
                
                <div class="p-4 flex flex-col flex-grow relative">
                    <div class="absolute top-3 right-3">
                        <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                            -${discount}%
                        </span>
                    </div>

                    <div class="flex items-center gap-3 mb-2">
                        <img alt="Logo ${pkg.name}" class="w-12 h-12 object-contain" src="${pkg.logo}">
                        <div>
                            <h1 class="text-xl font-bold text-gray-900 leading-tight">${pkg.title}</h1>
                            <p class="text-sm text-gray-500">Professional License</p>
                        </div>
                    </div>
                    
                    <p class="text-[15px] text-gray-600 mb-2 flex-grow leading-snug">${pkg.description}</p>
                    
                    <div class="flex items-end justify-between mt-auto border-t border-gray-200 pt-2">
                        <div>
                            <p class="text-sm text-gray-400 mb-0.5">Harga Normal</p>
                            <p class="text-base text-gray-400 line-through decoration-red-400">${formatCurrency(pkg.normalPrice)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-bold text-[#007aff]">${formatCurrency(pkg.price)}</p>
                            <p class="text-xs text-gray-500">${pkg.durationText}</p>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        
        const getDetailsAccordionHTML = (pkg) => {
            const colors = ['text-blue-500', 'text-green-500', 'text-yellow-500', 'text-red-500'];
            const featuresHTML = `<ul class="space-y-3">${pkg.features.map((f, index) => `<li class="flex items-start"><i class="fas fa-check-circle ${colors[index % colors.length]} mt-1 mr-3 text-lg feature-icon"></i><span class="text-theme-on-surface-variant text-sm leading-relaxed">${f}</span></li>`).join('')}</ul>`;

            const policyHTML = `
                <p class="mb-4 text-sm leading-relaxed">Dengan menggunakan layanan ini, Anda setuju untuk terikat pada S&K kami. Layanan ini tunduk pada kebijakan Apple yang berlaku.</p>
                <ul class="list-disc list-inside space-y-2 text-sm">
                    <li>Layanan untuk penggunaan wajar dan tidak melanggar hukum.</li>
                    <li>Garansi penuh jika upgrade gagal karena kesalahan kami.</li>
                    <li>Garansi tidak mencakup pemblokiran akun akibat pelanggaran oleh pengguna.</li>
                    <li>Perubahan kebijakan Apple di masa depan berada di luar kendali kami.</li>
                </ul>`;

            return `
                <details class="faq-item">
                    <summary>Detail Fitur & Keunggulan</summary>
                    <div class="faq-content">${featuresHTML}</div>
                </details>
                <details class="faq-item">
                    <summary>Informasi Penting</summary>
                    <div class="faq-content">${policyHTML}</div>
                </details>
            `;
        }

        const getPaymentMethodsHTML = (accounts) => {
            let html = `<h2 class="text-lg font-bold mb-4 text-gray-800 google-sans">3. Metode Pembayaran</h2>`;
            html += `<div class="payment-group">`;

            Object.entries(accounts).forEach(([key, account], index) => {
                const borderClass = index === 0 ? '' : 'border-t border-gray-200';
                html += `
                    <div class="${borderClass}">
                        <input type="radio" id="${key}" name="payment-method" value="${key}" class="payment-radio" ${index === 0 ? 'checked' : ''}>
                        <label for="${key}" class="payment-label">
                            <div class="form-payment-logo-container">
                                <img src="${account.logo}" alt="Logo ${account.displayName}" class="payment-logo">
                            </div>
                            <span class="font-medium text-gray-800 flex-grow google-sans text-sm">${account.displayName}</span>
                            <span class="custom-radio-button"><span class="dot"></span></span>
                        </label>
                    </div>
                `;
            });

            html += `</div>`;
            html += `
                <div class="bg-gray-50 p-3 mt-4 rounded-xl text-center text-xs text-gray-600">
                    <i class="fas fa-shield-alt text-green-600 mr-2"></i>
                    Pembayaran aman dan terenkripsi.
                </div>
            `;
            return html;
        };

        const getOrderDetailsHTML = (pkg, totalPrice) => {
            return `
            <div class="mt-4 pt-4 border-t border-m3-outline-variant">
                 <h3 class="text-lg font-bold mb-4 google-sans">Rincian Pesanan</h3>
                 <div class="space-y-3 text-m3-on-surface-variant">
                     <div class="flex justify-between items-center">
                         <span class="text-sm">${pkg.name}</span>
                         <div class="text-right">
                             <span class="font-semibold text-m3-on-surface text-md">${formatCurrency(pkg.price)}</span>
                         </div>
                     </div>
                     <div class="flex justify-between">
                         <span class="text-xs">Kode Unik</span>
                         <span class="font-medium text-m3-on-surface text-sm">${formatCurrency(uniqueCode)}</span>
                     </div>
                     <hr class="my-2 border-m3-outline-variant">
                     <div class="flex justify-between font-bold text-lg text-m3-on-surface google-sans">
                         <span>Total</span>
                         <span class="text-apple-blue">${formatCurrency(totalPrice)}</span>
                     </div>
                 </div>
            </div>`;
        }
        
        const getTestimonialsHTML = (pkg) => {
            const testimonialsData = pkg.testimonials;
            const singleTrackHTML = testimonialsData.map((testimonial, index) => {
                const starsHTML = Array(testimonial.stars).fill('<i class="fas fa-star text-yellow-400"></i>').join('');
                return `
                <div class="testimonial-slide">
                    <div class="testimonial-card">
                        <div class="testimonial-stars">${starsHTML}</div>
                        <div class="testimonial-author">
                            <img src="${testimonial.image}" alt="Foto profil ${testimonial.name}" class="testimonial-avatar">
                            <div>
                                <p class="testimonial-name">${testimonial.name}</p>
                                <p class="testimonial-role">${testimonial.role}</p>
                            </div>
                        </div>
                        <p class="testimonial-text">“${testimonial.text}”</p>
                    </div>
                </div>
            `}).join('');

            return `
            <div class="material-card p-4 md:p-6 rounded-2xl">
                <h2 class="text-xl font-bold text-center mb-2 google-sans">Testimoni Pelanggan Kami</h2>
                <p class="text-center text-gray-500 text-sm mb-6">Ribuan pelanggan telah puas dengan layanan kami.</p>
                <div class="testimonial-carousel-container" id="carousel-wrapper">
                    <div class="testimonial-track">
                        ${singleTrackHTML}
                    </div>
                    <div class="testimonial-track" aria-hidden="true">
                        ${singleTrackHTML}
                    </div>
                </div>
            </div>`;
        }

        const getInfoSectionHTML = () => {
             const faqHTML = `
                <h3 class="text-2xl font-bold mb-4 text-center google-sans">Informasi & Bantuan</h3>
                <div class="space-y-0">
                    <details class="faq-item">
                        <summary>Apakah produk ini resmi?</summary>
                        <div class="faq-content">Ya, produk yang kami tawarkan 100% original dan legal. Aktivasi dilakukan melalui undangan resmi dari Adobe.</div>
                    </details>
                    <details class="faq-item">
                        <summary>Bagaimana proses aktivasinya?</summary>
                        <div class="faq-content">Setelah pembayaran, kami akan mengirimkan undangan ke email Adobe Anda. Anda hanya perlu menerima undangan tersebut untuk mengaktifkan lisensi Creative Cloud.</div>
                    </details>
                    <details class="faq-item">
                        <summary>Apakah ini aman?</summary>
                        <div class="faq-content">Tentu saja. Kami tidak pernah meminta password akun Adobe Anda. Prosesnya 100% aman dan privasi Anda terjamin.</div>
                    </details>
                    <details class="faq-item">
                        <summary>Apa saja yang saya dapatkan?</summary>
                        <div class="faq-content">Anda akan mendapatkan akses ke semua aplikasi di dalam Adobe Creative Cloud (Photoshop, Illustrator, Premiere Pro, dll) dan penyimpanan cloud sebesar 100GB.</div>
                    </details>
                    <details class="faq-item">
                        <summary>Berapa lama prosesnya?</summary>
                        <div class="faq-content">Prosesnya sangat cepat, biasanya hanya 5-15 menit setelah konfirmasi pembayaran.</div>
                    </details>
                    <details class="faq-item">
                        <summary>Apakah ada garansi?</summary>
                        <div class="faq-content">Kami memberikan garansi uang kembali penuh jika proses aktivasi gagal karena kesalahan dari pihak kami.</div>
                    </details>
                </div>
            `;
            return faqHTML;
        };

        // --- FUNCTIONS ---
        function formatCurrency(value) {
            return `Rp${value.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
        }

        function getIndonesianTimezone() {
            const offset = new Date().getTimezoneOffset() / -60;
            if (offset === 7) return 'WIB';
            if (offset === 8) return 'WITA';
            if (offset === 9) return 'WIT';
            const sign = offset > 0 ? '+' : '-';
            const hours = Math.abs(Math.floor(offset));
            return `GMT${sign}${String(hours).padStart(2, '0')}:00`;
        }

        function updateDisplay() {
            const pkg = packages[currentPackageId];
            const totalPrice = pkg.price + uniqueCode;

            const infoContainer = elements.productInfoFormTop;
            const detailsAccordion = elements.detailsAccordionContainer;

            // 1. Start fade-out
            infoContainer.style.opacity = '0';
            detailsAccordion.style.opacity = '0';

            // 2. Wait for fade-out to finish, then update content and fade-in
            setTimeout(() => {
                // Update the HTML for the transitioning parts
                infoContainer.innerHTML = getProductInfoHTML(pkg);
                detailsAccordion.innerHTML = getDetailsAccordionHTML(pkg);

                // Update other parts that don't need transition
                elements.paymentMethodSelection.innerHTML = getPaymentMethodsHTML(paymentAccounts);
                elements.orderDetailsInForm.innerHTML = getOrderDetailsHTML(pkg, totalPrice);
                elements.testimonialsFull.innerHTML = getTestimonialsHTML(pkg);
                elements.infoSectionFull.innerHTML = getInfoSectionHTML();
                
                // 3. Start fade-in
                infoContainer.style.opacity = '1';
                detailsAccordion.style.opacity = '1';

            }, 300); // Match CSS transition duration
        }

        function generateWaLink(formData, pkg, totalPrice, paymentMethodName, paymentId) {
            const detailPesanan = `*Email (Apple ID):* ${formData.get('email')}\n`;
            const pesanWA = `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\n` +
                          `*ID Pembayaran:* ${paymentId}\n` +
                          `*Paket:* ${pkg.name}\n` +
                          `*Metode Pembayaran:* ${paymentMethodName}\n` +
                          `*Nama:* ${formData.get('nama')}\n` +
                          `*No. WhatsApp:* ${formData.get('whatsapp')}\n` +
                          detailPesanan +
                          `*Total Transfer:* ${formatCurrency(totalPrice)}\n\n` +
                          `Saya sudah melakukan transfer. Mohon untuk segera diproses. Terima kasih.`;
            return `https://wa.me/6285602152097?text=${encodeURIComponent(pesanWA)}`;
        }

        function showPaymentInstructions(formData, pkg, totalPrice, paymentAccount, paymentId, paymentMethodKey) {
            window.scrollTo(0, 0); // Scroll to top

            currentOrderDetails = {
                pkg,
                totalPrice,
                paymentId,
                nama: formData.get('nama'),
                whatsapp: formData.get('whatsapp')
            };

            elements.mainContentContainer.parentElement.style.display = 'none';
            elements.footer.style.display = 'none';

            const waLink = generateWaLink(formData, pkg, totalPrice, paymentAccount.displayName, paymentId);

            let accountLabel = 'Nomor Virtual Account';
            let instructionAccordionHTML = '';
            let paymentDetailsBlock = '';
            let paymentDeadlineFormatted = '';
            
            expiryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const datePart = expiryTime.toLocaleDateString('id-ID', dateOptions);
            const timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            const timePart = expiryTime.toLocaleTimeString('id-ID', timeOptions).replace(/\./g, ':');
            const timezoneString = `(${getIndonesianTimezone()})`;
            paymentDeadlineFormatted = `${datePart} pukul ${timePart} ${timezoneString}`;

            if (paymentMethodKey === 'qris') {
                paymentDetailsBlock = `
                    <div class="text-center">
                        <div id="qrcodeContainer" class="bg-white p-3 rounded-xl border-2 border-gray-200 w-full max-w-[250px] h-auto mx-auto my-4 material-card-elevated">
                            <div id="qrcode" class="flex justify-center items-center"></div>
                        </div>
                        <button id="downloadQrisButton" class="cta-button blue-button max-w-xs mx-auto">
                            <i class="fas fa-download mr-2"></i>
                            Unduh QRIS
                        </button>
                        <p class="text-center text-xs text-gray-600 mt-3">Pindai QR Code di atas menggunakan aplikasi perbankan atau e-wallet Anda.</p>
                    </div>
                `;
            } else {
                 paymentDetailsBlock = `
                    <div class="mt-4">
                        <p class="text-xs text-gray-500 mb-1">${accountLabel}</p>
                        <div class="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <p class="text-xl font-bold text-gray-800 tracking-wider google-sans">${paymentAccount.number}</p>
                            <button onclick="copyToClipboard('${paymentAccount.number}', '${accountLabel}')" class="copy-button-text">
                                <i class="far fa-copy mr-1"></i>
                                Salin
                            </button>
                        </div>
                    </div>
                `;
            }
            
            switch (paymentMethodKey) {
                case 'qris':
                    instructionAccordionHTML = `<details class="payment-accordion" open><summary>Cara Bayar via QRIS</summary><div class="payment-accordion-content"><ol class="space-y-3"><li>Buka aplikasi perbankan (m-banking) atau e-wallet Anda (GoPay, OVO, DANA, dll).</li><li>Pilih menu <strong>Bayar</strong>, <strong>Scan QR</strong>, atau <strong>QRIS</strong>.</li><li>Pindai (scan) kode QR yang ditampilkan di atas.</li><li>Pastikan nama merchant dan nominal pembayaran sudah sesuai.</li><li>Masukkan PIN Anda untuk menyelesaikan transaksi.</li><li>Simpan bukti pembayaran.</li></ol></div></details>`;
                    break;
                case 'bca_va':
                    instructionAccordionHTML = `<details class="payment-accordion"><summary>myBCA</summary><div class="payment-accordion-content"><ol class="space-y-2"><li>Buka aplikasi myBCA dan login.</li><li>Pilih menu <strong>Transfer</strong>, lalu pilih <strong>Virtual Account</strong>.</li><li>Pilih <strong>Tujuan Baru</strong>.</li><li>Masukkan nomor Virtual Account: <strong>${paymentAccount.number}</strong>.</li><li>Pilih sumber dana yang akan digunakan.</li><li>Masukkan nominal jika diminta.</li><li>Periksa detail transaksi, lalu tekan <strong>Lanjut</strong>.</li><li>Masukkan PIN untuk menyelesaikan transaksi.</li></ol></div></details><details class="payment-accordion"><summary>BCA Mobile</summary><div class="payment-accordion-content"><ol class="space-y-2"><li>Buka aplikasi BCA Mobile dan login.</li><li>Pilih menu <strong>m-Transfer</strong>, lalu pilih <strong>BCA Virtual Account</strong>.</li><li>Masukkan nomor <strong>${paymentAccount.number}</strong>.</li><li>Masukkan nominal jika diminta.</li><li>Periksa nama penerima, lalu tekan <strong>OK</strong>.</li><li>Masukkan PIN m-BCA untuk menyelesaikan transaksi.</li></ol></div></details><details class="payment-accordion"><summary>KlikBCA</summary><div class="payment-accordion-content"><ol class="space-y-2"><li>Buka situs KlikBCA dan login.</li><li>Pilih menu <strong>Transfer Dana</strong>, lalu pilih <strong>Transfer ke BCA Virtual Account</strong>.</li><li>Masukkan nomor <strong>${paymentAccount.number}</strong>.</li><li>Masukkan nominal transfer.</li><li>Tekan <strong>Lanjutkan</strong>, lalu masukkan kode KeyBCA Appli 1.</li><li>Tekan <strong>Kirim</strong> untuk menyelesaikan transaksi.</li></ol></div></details><details class="payment-accordion"><summary>ATM BCA</summary><div class="payment-accordion-content"><ol class="space-y-2"><li>Masukkan kartu ATM BCA dan PIN.</li><li>Pilih menu <strong>Transaksi Lainnya</strong>.</li><li>Pilih <strong>Transfer</strong>.</li><li>Pilih <strong>Ke Rekening BCA Virtual Account</strong>.</li><li>Masukkan nomor <strong>${paymentAccount.number}</strong>.</li><li>Masukkan nominal jika diminta, lalu konfirmasi.</li></ol></div></details>`;
                    break;
                default:
                     instructionAccordionHTML = `<details class="payment-accordion"><summary>Instruksi Umum</summary><div class="payment-accordion-content"><ol class="space-y-2"><li>Buka aplikasi perbankan atau e-wallet Anda.</li><li>Pilih menu transfer atau pembayaran.</li><li>Masukkan detail pembayaran yang tertera di atas.</li><li>Pastikan nominal transfer sesuai dengan total pembayaran hingga digit terakhir.</li><li>Selesaikan transaksi dan simpan bukti pembayaran Anda.</li></ol></div></details>`;
            }

            const paymentViewHTML = `
                <div class="payment-header">
                    <h2 class="google-sans">Selesaikan Pembayaran</h2>
                    <div class="countdown-timer" id="countdown-timer-display"></div>
                </div>
                <div class="max-w-lg mx-auto">
                    <div class="p-2 sm:p-4">
                        <div class="payment-card">
                            <h3 class="font-bold text-lg google-sans mb-1">Ringkasan Transaksi</h3>
                            <div class="flex justify-between items-center mt-2 text-xs text-gray-600">
                                <span>Nomor Invoice: <strong>${paymentId}</strong></span>
                                <a href="#" onclick="showDetailsModal(event)" class="font-semibold text-apple-blue">Lihat detail</a>
                            </div>
                            <hr class="my-4">
                            <p class="text-xs text-gray-600 mb-1">Total Pembayaran</p>
                            <div class="flex items-center justify-between">
                                <p class="text-2xl font-bold text-apple-blue google-sans">${formatCurrency(totalPrice)}</p>
                                <button onclick="copyToClipboard('${totalPrice}', 'Total Pembayaran')" class="copy-button-text">
                                    <i class="far fa-copy mr-1"></i>
                                    Salin
                                </button>
                            </div>
                        </div>
                        <div class="payment-card">
                            <h3 class="font-bold text-lg google-sans mb-3">Silahkan Bayar ke</h3>
                            <div class="flex justify-between items-start mt-3">
                                <div>
                                    <p class="text-sm text-gray-500">${paymentAccount.displayName}</p>
                                    <p class="font-semibold text-gray-800 text-md">${paymentAccount.accountHolder}</p>
                                </div>
                                <div class="payment-logo-container">
                                    <img src="${paymentAccount.logo}" alt="Logo ${paymentAccount.displayName}" class="payment-logo">
                                </div>
                            </div>
                            ${paymentDetailsBlock}
                            <div class="mt-6">
                                <p class="text-xs text-gray-500 mb-1">Bayar Sebelum</p>
                                <p class="font-semibold text-gray-800 text-sm">${paymentDeadlineFormatted}</p>
                            </div>
                            <a href="${waLink}" target="_blank" class="block mt-6">
                               <button class="confirm-button-outlined">
                                   <i class="fab fa-whatsapp mr-2"></i>
                                   Konfirmasi Pembayaran
                               </button>
                            </a>
                        </div>
                        <div class="payment-card">
                            <h3 class="font-bold text-lg google-sans mb-2">Cara Membayar</h3>
                            <div class="mt-2">
                                ${instructionAccordionHTML}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            elements.paymentInstructionContainer.innerHTML = paymentViewHTML;
            startCountdown();

            if (paymentMethodKey === 'qris') {
                setTimeout(() => {
                    const qrcodeContainer = document.getElementById('qrcode');
                    if(qrcodeContainer) {
                        try {
                            const qrisStatic = paymentAccount.number;
                            const qrisDinamis = createDynamicQrisString(qrisStatic, { nominal: totalPrice });
                            qrcodeContainer.innerHTML = '';
                            QRCode.toCanvas(qrisDinamis, {
                                width: 250, margin: 1, errorCorrectionLevel: 'H'
                            }, (err, canvas) => {
                                if (err) { throw err; }
                                canvas.style.width = "100%";
                                canvas.style.height = "auto";
                                canvas.style.borderRadius = "8px";
                                qrcodeContainer.appendChild(canvas);
                                document.getElementById('downloadQrisButton').addEventListener('click', () => {
                                    const link = document.createElement('a');
                                    link.download = `QRIS-${paymentId}.png`;
                                    link.href = canvas.toDataURL("image/png");
                                    link.click();
                                });
                            });
                        } catch (e) {
                            console.error("QRIS Generation Error:", e.message);
                            qrcodeContainer.innerHTML = `<p class="text-red-500 text-sm">Gagal membuat QR Code dinamis. Silakan coba lagi atau hubungi support.</p>`;
                        }
                    }
                }, 100);
            }
        }

        async function handleFormSubmit() {
            const formData = new FormData(elements.orderForm);
            const nama = formData.get('nama').trim();
            const whatsapp = formData.get('whatsapp').trim();
            const email = formData.get('email').trim();
            const paymentMethodKey = formData.get('payment-method');

            if (!nama || !whatsapp || !email || !paymentMethodKey) {
                showInfoModal('Data Belum Lengkap', 'Mohon lengkapi semua data yang diperlukan sebelum melanjutkan.');
                return;
            }
            
            if (!validateEmail(email)) {
                showInfoModal('Email Tidak Valid', 'Harap gunakan alamat email yang valid.');
                return;
            }

            const phoneValidationResult = validatePhoneNumber(whatsapp);
            if (!phoneValidationResult.isValid) {
                showInfoModal('Nomor WhatsApp Tidak Valid', phoneValidationResult.message);
                return;
            }

            elements.submitBtn.disabled = true;
            elements.submitBtn.innerHTML = '<i class="fas fa-spinner spinner mr-2"></i> Memproses...';

            const pkg = packages[currentPackageId];
            const totalPrice = pkg.price + uniqueCode;
            const paymentAccount = paymentAccounts[paymentMethodKey];
            const now = new Date();
            const paymentId = `INV-ADOBE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(totalPrice).slice(-3)}`;

            const scriptURL = 'https://script.google.com/macros/s/AKfycbySaAB2WT0D59UlLyZcXliWvNURCnHcRrqz5P8C2LCQbVdk0hn3Qkl1glGiLJSql_Wh/exec';
            const dataToSend = {
                nama: nama,
                whatsapp: whatsapp,
                email: email,
                paket: pkg.name,
                metodePembayaran: paymentAccount.displayName,
                totalTransfer: `Rp${totalPrice.toLocaleString('id-ID')}`,
                idPembayaran: paymentId,
                nomorRekening: paymentAccount.number,
                sheetName: formData.get('sheetName')
            };

            let submissionSuccess = false;
            try {
                await fetch(scriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    cache: 'no-cache',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dataToSend)
                });
                submissionSuccess = true;
            } catch (error) {
                console.error('Error submitting data:', error);
                submissionSuccess = false;
            }
            
            elements.submitBtn.disabled = false;
            elements.submitBtn.innerHTML = '<i class="fas fa-shopping-cart mr-2"></i> Beli Sekarang';

            if (submissionSuccess) {
                showPaymentInstructions(formData, pkg, totalPrice, paymentAccount, paymentId, paymentMethodKey);
            } else {
                showInfoModal('Pengiriman Gagal', 'Maaf, terjadi kesalahan saat mengirim data Anda. Silakan coba lagi atau hubungi kami.');
            }
        }
        
        function startCountdown() {
            const countdownElement = document.getElementById('countdown-timer-display');
            if (!countdownElement || !expiryTime) return;

            const interval = setInterval(() => {
                const now = new Date().getTime();
                const distance = expiryTime - now;

                if (distance < 0) {
                    clearInterval(interval);
                    countdownElement.innerHTML = "Waktu Habis";
                    return;
                }

                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownElement.innerHTML = `
                    <div class="countdown-item">
                        <span class="countdown-number">${String(hours).padStart(2, '0')}</span> Jam
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number">${String(minutes).padStart(2, '0')}</span> Menit
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number">${String(seconds).padStart(2, '0')}</span> Detik
                    </div>
                `;
            }, 1000);
        }
        
        const FIRST_NAMES = [ "Budi Santoso", "Ayu", "Rahmat", "Citra Dewi Kusuma", "Bayu Pratama", "Lina", "Wulan", "Adi", "Farhan Syahputra", "Hendra Wijaya", "Nana Puspita Dewi", "Joko", "Mega Sari", "Gilang Pramana Putra", "Sari", "Dedi", "Eka Suryani", "Teguh", "Putri Lestari Ayu", "Andi", "Bagus Wijaya", "Ilham Saputra Nugraha", "Rizal", "Mira Astuti", "Puspita", "Hari", "Tri Saputra", "Cahya Pratama", "Surya Darmawan Putra", "Wahyu Ramadhan", "Agus", "Indra Permana", "Linda", "Fajar Mahendra Saputra", "Yusuf", "Pramono Adi Nugroho", "Sinta Dewi", "Bima Pratama", "Dian", "Hasan Basri", "Nurul Aini", "Arif Budiman", "Feri", "Lukman Hakim", "Rangga", "Rini Anggraini Putri", "Tono", "Hadi Prasetyo", "Elisa Purnama", "Anisa Rahma", "Gunawan", "Melati", "Bagus Prasetyo Ramadhan", "Septi Amelia", "Cindy Amelia", "Windi Saputri", "Galih Pratama", "Evi", "Putra", "Slamet Riyadi", "Latif Hidayat", "Gita Puspita", "Darmawan", "Maya", "Erik Saputra Pratama", "Jani", "Jefri Maulana", "Bella Sari", "Maulana", "Novi Andriana Lestari", "Fajar Nugroho", "Taufik Hidayat", "Prasetyo", "Samsul", "Agung", "Endang", "Indah", "Hana Pertiwi", "Mirna", "Yulia", "Panca", "Niken", "Rio", "Adi Putra Ramadhan", "Ganda", "Wahida", "Robby Saputra", "Halim", "Firman Saputra", "Berlian Putra", "Ari", "Joko Setiawan", "Mustika", "Bahar", "Mega", "Erlangga", "Sofyan", "Doni", "Fatimah", "Dian Purnama Sari", "Rama", "Imam Saputra", "Johan", "Gusman", "Lintang", "Nabila", "Beni", "Purnama", "Murni", "Malik", "Nurlan", "Doni Saputra", "Lastri", "Berlinda", "Rasyid", "Tari", "Nia", "Tirta", "Juli Andriani", "Lutfi", "Suci", "Arman", "Yani", "Citra Ayu", "Harto", "Rangga Pratama", "Febrina", "Indra Gunawan Saputra", "Tomi", "Sutrisno", "Risma", "Jihan Ayu Pratiwi", "Lestari", "Dewi Kusuma", "Fahmi", "Rifki", "Wira", "Putra Wijaya", "Beni Setiawan", "Asep", "Gerry", "Prasetia", "Euis", "Latif", "Pajar", "Rahmat Hidayat", "Rudi", "Tika", "Danu", "Hesti", "Syahrul", "Anwar", "Miranti", "Nuraini", "Nurman", "Eman Kurnia", "Nirmala", "Hari Susanto", "Taufan", "Tono Prabowo", "Bayu Saputra Nugroho", "Darma", "Nurlaila", "Hafid", "Mustofa", "Elok", "Gunarto", "Novi", "Lasman", "Jamaludin", "Andi Wijaya Putra", "Herman", "Mila", "Wibowo", "Prayitno", "Adi Saputra", "Jamal", "Irfan", "Iskandar", "Yudha", "Lutris", "Samsul Hidayat", "Heru", "Bagus", "Rudianto", "Nanda Putri", "Laila Rahma", "Frans", "Hilda", "Cahya", "Rudi Pratama", "Setiawan", "Rangga Saputra", "Puspa", "Doni Prasetyo", "Nurul", "Febri", "Mega Sari Lestari", "Suyatno", "Tomiadi", "Fikri", "Lani", "Intan", "Johan Saputra", "Iwan", "Berliano", "Ilham", "Teddy", "Lani Puspita", "Eka Putri Andayani", "Hani", "Adi Wijaya", "Adit", "Dicky", "Gopal", "Pramono", "Gunadi", "Gilang", "Joko Prayitno Adi", "Mira", "Puspita Sari", "Maulana Hakim", "Putri Ayu Lestari", "Malik Prasetyo", "Toriq", "Joni", "Gilang Pratama", "Bagus Wijaya Putra", "Berlian", "Wandi", "Nurman Saputra", "Fajarudin", "Lutfi Pratama", "Citra", "Nanda", "Laras", "Tuti", "Yani Pratiwi", "Gusman Saputra", "Rangga Putra", "Prasetiawan", "Ismail", "Heri", "Adi Nugroho", "Putri", "Prasetyo Adi", "Dona", "Gani", "Jihan", "Puspita Dewi", "Rizal Maulana", "Mahendra", "Ayu Pratiwi", "Rangga Setiawan", "Lina Sari", "Fani", "Adi Wijaya Putra", "Sari Melati", "Andri", "Bima", "Teguh Santoso Adi", "Fajar", "Wulan Dewi", "Rama Pratama", "Nana", "Farhan", "Dion", "Melati Pertiwi", "Adi Putra", "Joko Santoso", "Doni Setiawan", "Lintang Pertiwi", "Septi", "Gopal Pramana", "Tomi Pratama", "Rio Nugraha", "Cindy", "Hafid Saputra", "Hendra", "Niken Lestari", "Rangga Nugroho", "Putri Ayu", "Sofyan Hidayat", "Robby", "Bima Saputra", "Indra", "Adi Kurniawan", "Nanda Saputra", "Gilang Saputra", "Wahyu", "Puspita Ayu", "Rudi Hartono", "Wulan Dewi Pertiwi", "Ayu Pratiwi Lestari", "Tono Adi", "Dedi Kurniawan", "Prasetyo Ramadhan", "Adi Setiawan", "Mira Lestari", "Farhan Syahputra Adi", "Nurul Hidayah", "Sari Anggraini", "Bayu", "Eman", "Putra Adi Nugroho", "Lestari Ayu", "Bambang", "Rangga Hidayat", "Mega Putri", "Adi Nugraha", "Anisa", "Siska", "Wandi Putra", "Fajar Saputra", "Gunawan Pratama", "Heri Setiawan", "Arif", "Ilham Nugroho", "Bagus Pratama", "Erlangga Putra", "Rian", "Pandu", "Tari Ayu", "Hendro", "Risma Ayu", "Adi Pratama", "Septi Ayu", "Bambang Santoso", "Lukman", "Gani Saputra", "Hasan", "Feri Kurniawan", "Tirta", "Bambang Prasetyo", "Pajar Saputra", "Arman Putra", "Murni Ayu", "Hafiz", "Euis Sari", "Bayu Nugroho", "Tomi Saputra", "Gerry Pratama", "Arif Prasetyo", "Johan Putra", "Hafid Nugraha", "Nabila Pertiwi", "Latif Saputra", "Ari Saputra", "Rio Saputra", "Tono Saputra", "Wandi Saputra", "Mahendra Putra", "Ilham Pratama", "Putri Dewi", "Adi Lestari", "Rangga Maulana", "Bayu Hidayat", "Fani Puspita", "Taufik", "Bagus Saputra", "Novi Puspita", "Rahmat Hidayatullah Putra", "Prayitno Saputra", "Adi Ramadhan", "Bayu Wijaya", "Gilang Nugraha", "Rangga Prasetyo", "Putra Purnama", "Wulan Pertiwi", "Adi Wijaya Ramadhan", "Budi", "Rian Pratama", "Samsul Nugroho", "Wahyu Saputra", "Teguh Prasetyo", "Fikri Nugraha", "Rizki Pratama" ];
        function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
        function generateRandomName() { return `${getRandomElement(FIRST_NAMES)}`; }
        
        function showNextNotification() {
            if (!elements.notifBox || !elements.notifName) return;
            elements.notifName.textContent = generateRandomName();
            elements.notifBox.classList.remove('show');
            void elements.notifBox.offsetWidth; // Trigger reflow
            elements.notifBox.classList.add('show');
        }

        function scheduleNextNotification() {
            const randomDelay = Math.floor(Math.random() * 10000) + 8000;
            setTimeout(() => {
                showNextNotification();
                scheduleNextNotification();
            }, randomDelay);
        }
        
        // --- INITIALIZATION ---
        elements.currentYear.textContent = new Date().getFullYear();
        elements.submitBtn.addEventListener('click', handleFormSubmit);
        elements.packageSelectionRadios.forEach(radio => {
            radio.addEventListener('change', (event) => {
                currentPackageId = event.target.value;
                updateDisplay();
            });
        });

        updateDisplay();
        
        if (elements.notifBox && elements.notifName) {
            setTimeout(scheduleNextNotification, 6000);
        }
        
        function getDetailsModalHTML(details) {
            const { pkg, totalPrice, paymentId, nama, whatsapp } = details;
            return `
                <div class="details-modal-header">
                    <h3>Ringkasan Transaksi</h3>
                    <button class="details-modal-close" onclick="closeDetailsModal()">&times;</button>
                </div>
                <div class="details-modal-body">
                    <p class="text-sm text-gray-500 mb-6">Nomor Invoice: <strong>${paymentId}</strong></p>
                    <div class="text-center mb-8">
                        <p class="text-sm text-gray-600 mb-2">Total Pembayaran</p>
                        <div class="flex items-center justify-center">
                            <p class="text-4xl font-bold text-apple-blue google-sans">${formatCurrency(totalPrice)}</p>
                            <button onclick="copyToClipboard('${totalPrice}', 'Total Pembayaran')" class="copy-button-text">
                                <i class="far fa-copy"></i>
                            </button>
                        </div>
                    </div>
                    <div class="space-y-4 border-t border-b border-gray-200 py-6 mb-6">
                        <div>
                            <div class="flex justify-between text-base">
                                <span>${pkg.name}</span>
                                <span class="font-semibold text-gray-800">${formatCurrency(pkg.price)}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-500 mt-1">
                                <span>1x ${formatCurrency(pkg.price)}</span>
                            </div>
                        </div>
                         <div class="flex justify-between text-sm">
                            <span class="text-gray-500">Kode Unik</span>
                            <span class="font-medium">${formatCurrency(uniqueCode)}</span>
                        </div>
                    </div>
                    <div class="space-y-3 mb-8">
                        <div class="flex justify-between text-base">
                            <span class="text-gray-600">Subtotal</span>
                            <span>${formatCurrency(totalPrice)}</span>
                        </div>
                        <div class="flex justify-between font-bold text-xl google-sans">
                            <span>Total Pembayaran</span>
                            <span class="text-apple-blue">${formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                    <div class="border-t border-gray-200 pt-6">
                        <h4 class="font-semibold mb-4 google-sans">Informasi Pelanggan</h4>
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <p class="text-gray-500 text-sm mb-1">Nama</p>
                                <p class="font-medium">${nama}</p>
                            </div>
                            <div>
                                <p class="text-gray-500 text-sm mb-1">Nomor Telepon</p>
                                <p class="font-medium">${whatsapp}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        window.showDetailsModal = function(event) {
            event.preventDefault();
            elements.detailsModalContent.innerHTML = getDetailsModalHTML(currentOrderDetails);
            elements.detailsModal.style.display = 'flex';
            elements.detailsModalContent.classList.remove('is-closing');
            elements.detailsModalContent.classList.add('is-open');
        }

        window.closeDetailsModal = function() {
            elements.detailsModalContent.classList.remove('is-open');
            elements.detailsModalContent.classList.add('is-closing');
            setTimeout(() => {
                elements.detailsModal.style.display = 'none';
            }, 300); // Match animation duration
        }

    });
    // --- GLOBAL HELPER FUNCTIONS ---
    const infoModal = document.getElementById('infoModal');
    function showInfoModal(title, message) {
        if (!infoModal) return;
        infoModal.querySelector('#modalTitle').textContent = title;
        infoModal.querySelector('#modalMessage').textContent = message;
        infoModal.style.display = 'flex';
    }

    function closeInfoModal() {
        if (!infoModal) return;
        infoModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == infoModal) { closeInfoModal(); }
        if (event.target == document.getElementById('detailsModal')) { closeDetailsModal(); }
        if (event.target == document.getElementById('imageModal')) { closeImageModal(); }
    }

    function copyToClipboard(text, entityName) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showInfoModal('Berhasil Disalin!', `${entityName} telah disalin ke clipboard.`);
        } catch (err) {
            showInfoModal('Gagal!', 'Gagal menyalin. Silakan coba secara manual.');
        }
        document.body.removeChild(textArea);
    }
    
    function toCRC16(input) {
        let crc = 0xFFFF;
        for (let i = 0; i < input.length; i++) {
            crc ^= input.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }

    function createDynamicQrisString(qris, { nominal }) {
        if (!qris) throw new Error('Parameter "qris" (string QRIS statis) dibutuhkan.');
        if (nominal === undefined) throw new Error('Parameter "nominal" dibutuhkan.');

        let qrisModified = qris.slice(0, -4).replace("010211", "010212");
        const nominalStr = String(Math.round(nominal));
        const amountLength = nominalStr.length < 10 ? "0" + nominalStr.length : nominalStr.length.toString();
        const amountPart = "54" + amountLength + nominalStr;
        
        if (!qrisModified.includes("5802ID")) {
            throw new Error("Format string QRIS tidak dikenali (tidak ditemukan '5802ID').");
        }

        let finalQris = qrisModified.replace("5802ID", amountPart + "5802ID");
        const crc = toCRC16(finalQris);

        return finalQris + crc;
    }

    // --- Image Modal Functions ---
    const imageModal = document.getElementById('imageModal');
    const modalImg = document.getElementById("modalImage");
    let currentImageIndex;
    const testimonials = [
        { name: "Siti Aminah", role: "Guru Kelas", text: "Alhamdulillah, prosesnya cepat dan mudah. Sekarang semua aplikasi Adobe sudah aktif, sangat membantu pekerjaan saya.", stars: 5, image: "https://randomuser.me/api/portraits/women/1.jpg" },
        { name: "Budi Santoso", role: "Desainer Grafis", text: "Mantap! Langganan di sini lebih hemat. Pelayanannya juga ramah dan responsif. Terima kasih banyak!", stars: 5, image: "https://randomuser.me/api/portraits/men/2.jpg" },
        { name: "Rina Kartika", role: "Mahasiswa DKV", text: "Tugas kuliah jadi lancar jaya. Semua aplikasi premium bisa diakses tanpa kendala. Recommended banget buat mahasiswa.", stars: 5, image: "https://randomuser.me/api/portraits/women/3.jpg" },
        { name: "Agus Setiawan", role: "Fotografer", text: "Prosesnya nggak sampai 15 menit, langsung aktif. Bisa langsung edit foto-foto klien. Sangat profesional.", stars: 5, image: "https://randomuser.me/api/portraits/men/4.jpg" },
        { name: "Dewi Lestari", role: "Content Creator", text: "Fitur AI Generatif di Photoshop sangat berguna. Senang sekali bisa dapat akses penuh dengan harga terjangkau.", stars: 5, image: "https://randomuser.me/api/portraits/women/5.jpg" },
        { name: "Eko Prasetyo", role: "Video Editor", text: "Awalnya ragu, tapi ternyata 100% amanah dan legal. Premiere Pro dan After Effects lancar tanpa masalah.", stars: 5, image: "https://randomuser.me/api/portraits/men/6.jpg" },
        { name: "Fitriani", role: "Wirausaha", text: "Sangat membantu untuk membuat materi promosi usaha saya. Desain jadi lebih menarik dan profesional.", stars: 5, image: "https://randomuser.me/api/portraits/women/7.jpg" },
        { name: "Heru Wibowo", role: "Arsitek", text: "Illustrator dan InDesign sangat penting untuk pekerjaan saya. Di sini prosesnya cepat dan harganya terbaik.", stars: 5, image: "https://randomuser.me/api/portraits/men/8.jpg" },
        { name: "Indah Permata", role: "Animator", text: "Langganan Adobe CC penuh memang mahal, untung ada solusi ini. Animate dan Character Animator siap digunakan!", stars: 5, image: "https://randomuser.me/api/portraits/women/9.jpg" },
        { name: "Joko Susilo", role: "Pegawai Kantor", text: "Pelayanannya top! Prosesnya dijelaskan dengan baik dan sangat sabar menjawab pertanyaan saya. Sukses selalu!", stars: 5, image: "https://randomuser.me/api/portraits/men/10.jpg" },
        { name: "Lia Anggraini", role: "Guru Seni", text: "Anak-anak didik saya jadi lebih semangat belajar desain dengan software asli. Terima kasih sudah mempermudah.", stars: 5, image: "https://randomuser.me/api/portraits/women/11.jpg" },
        { name: "Muhammad Iqbal", role: "Web Developer", text: "Adobe XD dan Photoshop jadi senjata utama. Proses aktivasi yang cepat sangat menghemat waktu saya.", stars: 5, image: "https://randomuser.me/api/portraits/men/12.jpg" },
        { name: "Nadia Putri", role: "Social Media Manager", text: "Adobe Express dan Premiere Rush sangat praktis untuk konten harian. Harga yang ditawarkan sangat sepadan.", stars: 5, image: "https://randomuser.me/api/portraits/women/13.jpg" },
        { name: "Putra Wijaya", role: "Pelajar", text: "Buat tugas sekolah jadi gampang banget. Nggak perlu lagi bingung cari-cari software. Pokoknya mantap!", stars: 5, image: "https://randomuser.me/api/portraits/men/14.jpg" },
        { name: "Ratna Sari", role: "UI/UX Designer", text: "Workflow jadi lebih efisien karena bisa pakai semua aplikasi Adobe. Prosesnya juga sangat aman, tidak perlu password.", stars: 5, image: "https://randomuser.me/api/portraits/women/15.jpg" },
        { name: "Rizky Pratama", role: "Musisi", text: "Adobe Audition sangat membantu untuk rekaman. Kualitasnya tidak diragukan lagi. Pelayanan cepat dan terpercaya.", stars: 5, image: "https://randomuser.me/api/portraits/men/16.jpg" },
        { name: "Siska Amelia", role: "Ilustrator", text: "Akhirnya bisa pakai Fresco dan Illustrator versi terbaru. Benar-benar memuaskan. Terima kasih banyak, kak!", stars: 5, image: "https://randomuser.me/api/portraits/women/17.jpg" },
        { name: "Teguh Santoso", role: "Pengembang Aplikasi", text: "Sangat direkomendasikan! Prosesnya profesional, cepat, dan yang terpenting, 100% legal. Tidak ada masalah sama sekali.", stars: 5, image: "https://randomuser.me/api/portraits/men/18.jpg" },
        { name: "Wulan Dari", role: "Marketing", text: "Membuat aset marketing jadi lebih mudah dan hasilnya bagus. Sangat worth it untuk investasi jangka panjang.", stars: 5, image: "https://randomuser.me/api/portraits/women/19.jpg" },
        { name: "Yusuf Maulana", role: "Dosen", text: "Membantu saya dalam menyiapkan materi ajar yang lebih interaktif dan menarik. Prosesnya tidak berbelit-belit.", stars: 5, image: "https://randomuser.me/api/portraits/men/20.jpg" },
        { name: "Zahra Aliyah", role: "Penulis", text: "InCopy dan InDesign sangat berguna. Proses aktivasinya sangat cepat, langsung bisa dipakai untuk layout buku.", stars: 5, image: "https://randomuser.me/api/portraits/women/21.jpg" },
        { name: "Andi Wijaya", role: "3D Artist", text: "Akses ke Substance 3D Painter dan Designer sangat membantu. Harga yang ditawarkan jauh lebih murah.", stars: 5, image: "https://randomuser.me/api/portraits/men/22.jpg" },
        { name: "Citra Kirana", role: "Fashion Designer", text: "Illustrator jadi andalan untuk membuat desain pola. Terima kasih, pelayanannya sangat memuaskan dan cepat.", stars: 5, image: "https://randomuser.me/api/portraits/women/23.jpg" },
        { name: "Doni Saputra", role: "Streamer", text: "Premiere Pro dan After Effects buat editing video streaming jadi lebih keren. Nggak nyesel langganan di sini.", stars: 5, image: "https://randomuser.me/api/portraits/men/24.jpg" },
        { name: "Elisa Chandra", role: "Wedding Organizer", text: "Bikin portofolio dan materi promosi jadi lebih gampang dan elegan. Prosesnya super cepat dan terpercaya.", stars: 5, image: "https://randomuser.me/api/portraits/women/25.jpg" },
        { name: "Fajar Nugroho", role: "Podcaster", text: "Adobe Audition-nya mantap. Kualitas audio jadi lebih jernih. Proses aktivasi juga nggak pakai lama.", stars: 5, image: "https://randomuser.me/api/portraits/men/26.jpg" },
        { name: "Gita Permata", role: "Event Planner", text: "Semua kebutuhan desain untuk acara, mulai dari undangan sampai banner, bisa dikerjakan dengan mudah. Recommended!", stars: 5, image: "https://randomuser.me/api/portraits/women/27.jpg" },
        { name: "Hadi Pranoto", role: "Peneliti", text: "InDesign dan Illustrator sangat membantu untuk visualisasi data penelitian. Prosesnya cepat dan sellernya amanah.", stars: 5, image: "https://randomuser.me/api/portraits/men/28.jpg" },
        { name: "Irma Suryani", role: "Admin Online Shop", text: "Photoshop dan Lightroom buat foto produk jadi lebih menarik. Penjualan jadi meningkat. Terima kasih!", stars: 5, image: "https://randomuser.me/api/portraits/women/29.jpg" },
        { name: "Krisna Murti", role: "Motion Graphic Designer", text: "After Effects dan Cinema 4D integrasinya lancar. Senang bisa dapat akses penuh dengan harga segini. Mantap!", stars: 5, image: "https://randomuser.me/api/portraits/men/30.jpg" }
    ];