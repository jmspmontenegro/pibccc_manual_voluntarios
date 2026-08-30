        function printChecklist() {
            window.print();
        }

        // Checklist data
        const checklistItems = [
            ["Aprovar o evento com a liderança", "Antes de qualquer divulgação"],
            ["Verificar disponibilidade de sala com a Priscila", "Mín. 15 dias de antecedência"],
            ["Fazer a reserva formal da sala", "Informar sala, entrada e saída"],
            ["Reservar mesas e/ou toalhas (se necessário)", "Informar quantidade"],
            ["Reservar a cozinha (se necessário)", "Informar utensílios a utilizar"],
            ["Solicitar compras ou lanche", "Mín. 15 dias de antecedência"],
            ["Solicitar lembrancinhas (se houver)", "Mín. 30 dias de antecedência"],
            ["Organizar a equipe do evento", "Definir funções: antes, durante e após"],
            ["Solicitar divulgação (Instagram / avisos)", "Enviar material para líder do ministério de comunicação"],
            ["Solicitar fotografia do evento", "Solicitar à equipe de comunicação"],
            ["Avisar ministério de som (se necessário)", "Com antecedência suficiente"],
            ["Realizar o evento", ""],
            ["Organizar e devolver o espaço como encontrado", "Lavar louça, dobrar toalhas, guardar tudo"]
        ];

        const tbody = document.getElementById('checklist-body');
        if (tbody) {
            checklistItems.forEach((item, i) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><div class="check-box" id="cb-${i}" onclick="toggleCheck(${i})"></div></td>
                    <td>
                      <div class="step-label" id="lbl-${i}">${item[0]}</div>
                      ${item[1] ? `<div class="step-note">${item[1]}</div>` : ''}
                    </td>
                    <td>${item[1] ? `<span class="step-timing">${item[1]}</span>` : ''}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        function toggleCheck(i) {
            const cb = document.getElementById(`cb-${i}`);
            const lbl = document.getElementById(`lbl-${i}`);
            if (cb && lbl) {
                cb.classList.toggle('checked');
                lbl.style.textDecoration = cb.classList.contains('checked') ? 'line-through' : '';
                lbl.style.color = cb.classList.contains('checked') ? 'var(--text-muted)' : '';
            }
        }

        // Sidebar toggle
        function toggleSidebar() {
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('overlay');
            if (sidebar) sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('open');
        }

        // Print functionality
        function printChecklist() {
            document.body.classList.add('checklist-only');
            window.print();
            document.body.classList.remove('checklist-only');
        }

        // Active nav highlight
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('.section, .verse-banner');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navItems.forEach(n => {
                        n.classList.toggle('active', n.getAttribute('href') === '#' + id);
                    });
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('[id]').forEach(el => observer.observe(el));

        // Image Modal Logic
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImg');
        const floorPlans = document.querySelectorAll('.floor-plan');

        if (modal && modalImg) {
            floorPlans.forEach(img => {
                img.onclick = function() {
                    modal.classList.add('active');
                    modalImg.src = this.src;
                    document.body.style.overflow = 'hidden'; // Prevent scroll
                }
            });

            window.closeModal = function() {
                modal.classList.remove('active');
                document.body.style.overflow = ''; // Restore scroll
            }

            modal.onclick = function(e) {
                if (e.target !== modalImg) {
                    closeModal();
                }
            }
        }
