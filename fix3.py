import re

with open('cliente_efb7521_old.html', 'r', encoding='utf-16') as f:
    html = f.read()

catHtml = '''
            <p style=\"font-size: 0.85rem; color: var(--color-cyan); font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;\">0. ¿Qué vehículo tienes?</p>
            <div id=\"config-cat-grid\" class=\"wash-menu-grid\" style=\"grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-bottom: 2rem;\">
                <!-- Dinámico -->
            </div>
'''
html = html.replace('<p style=\"font-size: 0.85rem; color: var(--color-cyan); font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;\">1. Elige tu Servicio</p>', catHtml + '\n            <p style=\"font-size: 0.85rem; color: var(--color-cyan); font-weight: 700; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;\">1. Elige tu Servicio (Puedes elegir varios)</p>')

newJs = '''
        let VEHICLE_CATEGORIES = [];
        const savedCatSettings = localStorage.getItem('lavadero_vehicle_categories');
        if (savedCatSettings) {
            VEHICLE_CATEGORIES = JSON.parse(savedCatSettings);
        } else {
            VEHICLE_CATEGORIES = [
                { id: 'Auto', surcharge: 0, icon: '🚗' },
                { id: 'SUV', surcharge: 20, icon: '🚙' },
                { id: 'Camioneta', surcharge: 50, icon: '🛻' }
            ];
        }

        let pendingCats = '';
        let currentSurcharge = 0;

        function renderCatMenu() {
            const grid = document.getElementById('config-cat-grid');
            if(!grid) return;
            let h = '';
            VEHICLE_CATEGORIES.forEach(cat => {
                h += `
                <div class="wash-menu-card" data-cat="${cat.id}" onclick="selectCat(this, '${cat.id}', ${cat.surcharge})">
                    <div class="check-badge">✓</div>
                    <div class="wash-card-icon" style="font-size: 1.5rem;">${cat.icon}</div>
                    <div class="wash-card-title" style="font-size: 0.65rem;">${cat.id} ${cat.surcharge >= 0 ? '+' : ''}${cat.surcharge}%</div>
                </div>
                `;
            });
            grid.innerHTML = h;
            
            const urlCat = urlParams.get('cat');
            if (urlCat) {
                const catNode = document.querySelector(`#config-cat-grid .wash-menu-card[data-cat="${urlCat}"]`);
                if (catNode) {
                    const found = VEHICLE_CATEGORIES.find(c => c.id === urlCat);
                    selectCat(catNode, urlCat, found ? found.surcharge : 0);
                    document.getElementById('config-cat-grid').parentElement.style.display = 'none';
                }
            } else if (VEHICLE_CATEGORIES.length > 0) {
                const first = document.querySelector(`#config-cat-grid .wash-menu-card`);
                if (first) selectCat(first, VEHICLE_CATEGORIES[0].id, VEHICLE_CATEGORIES[0].surcharge);
            }
        }

        function selectCat(el, id, perc) {
            document.querySelectorAll('#config-cat-grid .wash-menu-card').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            pendingCats = id;
            currentSurcharge = perc;
            renderConfigMenu();
        }

        let pendingTypeIds = [];

        function renderConfigMenu() {
            const grid = document.getElementById('config-wash-grid');
            if(!grid) return;
            let html = '';
            for (const [id, details] of Object.entries(WASH_DETAILS)) {
                // surcharge is a percentage here based on fix_cliente logic
                const adjustedPrice = Math.round(details.price * (1 + (currentSurcharge / 100)));
                const isSelected = pendingTypeIds.includes(id) ? 'selected' : '';
                html += `
                <div class="wash-menu-card ${isSelected}" data-type="${id}" onclick="selectWash(this, '${id}')">
                    <div class="check-badge">✓</div>
                    <div class="wash-card-title" style="font-size: 0.75rem; min-height: 2.5em; display:flex; align-items:center; justify-content:center;">${details.name}</div>
                    <div class="wash-card-price" style="font-size: 0.9rem;">$${adjustedPrice.toLocaleString('es-AR')}</div>
                </div>
                `;
            }
            grid.innerHTML = html;
        }

        function selectWash(el, id) {
            if (pendingTypeIds.includes(id)) {
                pendingTypeIds = pendingTypeIds.filter(i => i !== id);
                el.classList.remove('selected');
            } else {
                pendingTypeIds.push(id);
                el.classList.add('selected');
            }
        }

        function confirmarConfiguracion() {
            if (!pendingCats) { alert('Por favor, selecciona qué vehículo tienes.'); return; }
            if (pendingTypeIds.length === 0) { alert('Por favor, selecciona al menos un tipo de lavado.'); return; }
            if (!pendingPay) { alert('Por favor, selecciona una forma de pago.'); return; }
            
            pendingType = pendingTypeIds.join(',');
            
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('cat', pendingCats);
            newUrl.searchParams.set('t', pendingType);
            newUrl.searchParams.set('pay', pendingPay);
            window.history.pushState({}, '', newUrl);

            type = pendingType;
            payment = pendingPay;
            
            configView.style.display = 'none';
            trackingView.style.display = 'block';
            
            document.getElementById('car-display-container').innerHTML = getCarSvg(color);
            initTrackingView();
        }
'''

# Use safe replace with regex that bounds properly
html = re.sub(r'function renderConfigMenu\(\) \{.*?function confirmarConfiguracion\(\) \{.*?initTrackingView\(\);\s*\}', newJs, html, flags=re.DOTALL)

# Add renderCatMenu to INIT LOGIC
if 'renderCatMenu();' not in html:
    html = re.sub(r'if \(!type\) \{', 'if (!type || !payment) {\n            renderCatMenu();', html)

# Add payment forms
payment_html = '''
            <p style="font-size: 0.85rem; color: var(--color-cyan); font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">2. Forma de Pago</p>
            <div id="config-pay-grid" class="wash-menu-grid" style="grid-template-columns: repeat(3, 1fr); gap: 0.5rem;">
                <div class="wash-menu-card" data-pay="efectivo" onclick="selectPayment(this, 'efectivo')">
                    <div class="check-badge">✓</div>
                    <div class="wash-card-icon" style="font-size: 1.2rem;">💵</div>
                    <div class="wash-card-title" style="font-size: 0.65rem;">Efectivo</div>
                </div>
                <div class="wash-menu-card" data-pay="tarjeta" onclick="selectPayment(this, 'tarjeta')">
                    <div class="check-badge">✓</div>
                    <div class="wash-card-icon" style="font-size: 1.2rem;">💳</div>
                    <div class="wash-card-title" style="font-size: 0.65rem;">Tarjeta</div>
                </div>
                <div class="wash-menu-card" data-pay="transferencia" onclick="selectPayment(this, 'transferencia')">
                    <div class="check-badge">✓</div>
                    <div class="wash-card-icon" style="font-size: 1.2rem;">📱</div>
                    <div class="wash-card-title" style="font-size: 0.65rem;">MercadoPago</div>
                </div>
            </div>
'''
# Insert payment before the confirm button
if 'config-pay-grid' not in html:
    html = html.replace('<button onclick="confirmarConfiguracion()" class="btn btn-primary" style="width: 100%; margin-top: 2rem; padding: 1rem; font-size: 1rem; border-radius: 1rem;">Confirmar y Comenzar</button>',
                       payment_html + '\n            <button onclick="confirmarConfiguracion()" class="btn btn-primary" style="width: 100%; margin-top: 2rem; padding: 1rem; font-size: 1rem; border-radius: 1rem;">Confirmar y Comenzar</button>')

# Add payment method javascript variable initialization
if 'let payment = ' not in html:
    html = html.replace("let type = urlParams.get('t') || '';", "let type = urlParams.get('t') || '';\n        let payment = urlParams.get('pay') || '';")
if 'let pendingPay = ' not in html:
    html = html.replace("let pendingType = '';", "let pendingType = '';\n        let pendingPay = '';\n\n        function selectPayment(el, method) {\n            document.querySelectorAll('#config-pay-grid .wash-menu-card').forEach(c => c.classList.remove('selected'));\n            el.classList.add('selected');\n            pendingPay = method;\n        }")


# Add footer
footer = '''
    <footer class=\"app-footer\">
        &copy; 2026 <strong>Omar Adamo</strong>. Todos los derechos reservados. <br>
        Lavadero Estética Vehicular • Software Independiente
    </footer>
'''
html = re.sub(r'<div class=\"client-footer\">.*?</div>', footer, html, flags=re.DOTALL)

with open('cliente.html', 'w', encoding='utf-8') as f:
    f.write(html)
