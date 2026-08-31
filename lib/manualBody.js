export const manualBodyHtml = `
        <button class="mobile-toggle" onclick="toggleSidebar()">☰</button>
        <div class="mobile-logo"><img src="/img/LOGO START ROXA PNG.png" alt="Start" style="height:24px;display:block;"></div>
        <div style="width: 44px;"></div> <!-- Spacer to keep logo centered -->
    </nav>

    <div class="sidebar-overlay" id="overlay" onclick="toggleSidebar()"></div>

    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-logo">
            <div class="ministry-name"><img src="/img/LOGO START ROXA PNG.png" alt="Start" style="height:32px;display:block;"></div>
            <div class="church-name">PIB Curitiba <br>Campus Campo Comprido</div>
            <span class="badge">Manual do Voluntário</span>
        </div>

        <div class="nav-label">Fundamentos</div>
        <a class="nav-item" href="#normas"><span class="nav-icon">⚖️</span> Normas e Legislação</a>
        <a class="nav-item" href="#procedimentos"><span class="nav-icon">📋</span> Procedimentos</a>
        <a class="nav-item" href="#espacos"><span class="nav-icon">📍</span> Nossos Espaços</a>
        <a class="nav-item" href="#culto"><span class="nav-icon">⛪</span> Culto</a>

        <div class="nav-label">Sistema & Materiais</div>
        <a class="nav-item" href="#totem"><span class="nav-icon">🖥️</span> Totem</a>
        <a class="nav-item" href="#etiquetas"><span class="nav-icon">🏷️</span> Etiquetas</a>
        <a class="nav-item" href="#materiais"><span class="nav-icon">🗂️</span> Materiais</a>

        <div class="nav-label">Eventos</div>
        <a class="nav-item" href="#eventos"><span class="nav-icon">🎉</span> Organização de Eventos</a>
        <a class="nav-item" href="#mesas"><span class="nav-icon">🪑</span> Mesas e Toalhas</a>
        <a class="nav-item" href="#cozinha"><span class="nav-icon">🍽️</span> Uso da Cozinha</a>
        <a class="nav-item" href="#som"><span class="nav-icon">🎤</span> Som e Audiovisual</a>
        <a class="nav-item" href="#checklist"><span class="nav-icon">✅</span> Checklist para Eventos</a>

        <div class="nav-label">Compras & Logística</div>
        <a class="nav-item" href="#lanche"><span class="nav-icon">☕</span> Café e Lanche</a>
        <a class="nav-item" href="#cantina"><span class="nav-icon">🛒</span> Cantina</a>
        <a class="nav-item" href="#compras"><span class="nav-icon">📦</span> Pedidos de Compras</a>
        <a class="nav-item" href="#lembrancas"><span class="nav-icon">🎁</span> Lembrancinhas</a>

        <div class="nav-label">Comunicação</div>
        <a class="nav-item" href="#divulgacao"><span class="nav-icon">📢</span> Divulgação</a>
        <a class="nav-item" href="#equipe"><span class="nav-icon">👥</span> Equipe do Evento</a>

        <div class="nav-label">Finalização</div>
        <a class="nav-item" href="#calendario"><span class="nav-icon">📅</span> Calendário</a>
        <a class="nav-item" href="#organograma"><span class="nav-icon">📊</span> Organograma</a>
        <a class="nav-item" href="#contatos"><span class="nav-icon">📞</span> Contatos</a>
    </aside>

    <!-- MAIN -->
    <main class="main">

        <!-- HERO -->
        <div class="hero">
            <div class="hero-tag">📖 Documento Oficial · 2026</div>
            <h1>Manual do<br><em>Voluntário</em></h1>
            <p class="subtitle">Guia completo para organização, eventos, recursos e funcionamento do ministério
                infantil da PIB Curitiba - Campus Campo Comprido.</p>
            <div class="hero-actions">
                <button class="btn-pdf" onclick="window.print()">
                    📥 Download em PDF
                </button>
            </div>
        </div>

        <!-- VERSE -->
        <div class="verse-banner" id="verse">
            <div class="verse-bar"></div>
            <div class="verse-text">
                "Portanto, meus amados irmãos, sede firmes e constantes, sempre abundantes na obra do Senhor, sabendo
                que o vosso trabalho não é vão no Senhor."
                <span class="verse-ref">1 Coríntios 15:58</span>
            </div>
        </div>

        <!-- CONTENT -->
        <div class="content">

            <!-- SEÇÃO 1 – INTRODUÇÃO -->
            <section class="section" id="introducao">
                <div class="section-header">
                    <div class="section-num" style="background:var(--text-muted);">i</div>
                    <span class="section-icon">👋</span>
                    <h2>Introdução</h2>
                </div>
                <p>Bem-vindo à equipe do <strong>Start</strong>! É uma alegria ter você servindo neste
                    ministério. Este manual foi criado para orientar todos os voluntários sobre os processos,
                    responsabilidades e boas práticas do nosso trabalho com as crianças.</p>
                <p>Aqui você encontrará informações sobre organização de eventos, uso dos espaços da igreja, pedidos de
                    compras, funcionamento do totem de cadastro e organização de materiais.</p>

                <div class="card-grid" style="margin-top:24px;">
                    <div class="info-card">
                        <div class="card-icon">🎯</div>
                        <div class="card-title">Organização</div>
                        <p>Garantir clareza e eficiência em todas as atividades do ministério.</p>
                    </div>
                    <div class="info-card">
                        <div class="card-icon">💬</div>
                        <div class="card-title">Comunicação</div>
                        <p>Promover boa comunicação entre voluntários, liderança e secretaria.</p>
                    </div>
                    <div class="info-card">
                        <div class="card-icon">🏛️</div>
                        <div class="card-title">Cuidado</div>
                        <p>Zelar com responsabilidade pelos recursos e espaços da igreja.</p>
                    </div>
                    <div class="info-card">
                        <div class="card-icon">❤️</div>
                        <div class="card-title">Excelência</div>
                        <p>Oferecer às crianças um ambiente seguro, acolhedor e preparado com amor.</p>
                    </div>
                </div>

                <div class="golden-rule" style="margin-top:28px;">
                    <div class="rule-title">⭐ Princípio Fundamental</div>
                    <p>Tudo que usamos deve ser devolvido nas mesmas condições — ou melhores — do que encontramos. Esse
                        é o nosso padrão de excelência e cuidado com a casa de Deus.</p>
                </div>
            </section>
            <!-- SEÇÃO 1 – NORMAS E LEGISLAÇÃO -->
            <section class="section" id="normas">
                <div class="section-header">
                    <div class="section-num">1</div>
                    <span class="section-icon">⚖️</span>
                    <h2>Normas e Legislação</h2>
                </div>
                
                <div class="subsection">
                    <h3>Termo de Adesão de Voluntariado</h3>
                    <p>Ao se tornar voluntário no Ministério Infantil, você se compromete a auxiliar a Primeira Igreja Batista de Curitiba na implementação e desenvolvimento de seus objetivos institucionais, observando as diretrizes aqui traçadas, bem como aquelas informadas pelo responsável da área de Voluntariado.</p>
                    <p>Estando ciente de que o presente Termo de Adesão tem prazo indeterminado.</p>
                    <div class="callout info">
                        <div class="callout-icon">⚖️</div>
                        <div class="callout-body">
                            <div class="callout-title">Base Legal</div>
                            <p>O serviço voluntário, conforme a Lei n° 9.608/1998, não gera vínculo empregatício, nem obrigação de natureza trabalhista, previdenciária ou afim, não cabendo qualquer remuneração ou ressarcimento.</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Política de Proteção</h3>
                    <p>Acreditamos que as crianças, adolescentes, mulheres, pessoas com deficiência e idosos precisam de atenção e cuidados especiais. Entendemos que foram criados por Deus com valor integral e precisam ter todos os seus direitos assegurados.</p>
                    <p>Somos contrários a todas as formas de violência, incluindo negligência, exploração, danos físicos, emocionais e sexuais. Assumimos o compromisso de amar, respeitar, proteger e não omitir.</p>
                </div>

                <div class="subsection">
                    <h3>Antecedentes Criminais</h3>
                    <p>Todas as pessoas que atuarem com crianças e adolescentes (mesmo voluntários) devem apresentar <strong>certidão de antecedentes criminais atualizada a cada 6 meses</strong>.</p>
                    <div class="callout warning">
                        <div class="callout-icon">⚠️</div>
                        <div class="callout-body">
                            <div class="callout-title">Obrigatoriedade Legal</div>
                            <p>Isso vale para professores, líderes, auxiliares e qualquer voluntário. Base legal: Art. 59-A do ECA (incluído pela Lei 14.811/2024).</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Termo de Compromisso</h3>
                    <ol class="styled">
                        <li>Ser membro, priorizar tempo para frequentar os cultos da igreja e estar em uma célula.</li>
                        <li>Praticar vida devocional, alimentando-se da Palavra, da oração e jejum.</li>
                        <li>Compartilhar desconfortos quando alguém agir ou falar de forma imprópria na equipe.</li>
                        <li>Quando necessário, disponibilizar tempo para ouvir e orar com pessoas.</li>
                        <li>Agendar e estar presente nas atividades (domingos, sábados ou quartas, conforme escala).</li>
                        <li>Estar presente em reuniões, treinamentos e pastoreio da equipe.</li>
                        <li>Estar submetido formalmente aos cuidados pastorais da liderança deste ministério.</li>
                        <li>Informar imediatamente a liderança sobre fatos relatados pelas crianças (abusos, violência, etc.).</li>
                        <li>Ser abstêmio quanto ao uso de bebidas alcoólicas e cigarros (ser exemplo).</li>
                        <li>Fazer bom uso das redes sociais e vestir-se de modo adequado e equilibrado.</li>
                    </ol>
                </div>
            </section>

            <!-- SEÇÃO 2 – PROCEDIMENTOS -->
            <section class="section" id="procedimentos">
                <div class="section-header">
                    <div class="section-num">2</div>
                    <span class="section-icon">📋</span>
                    <h2>Procedimentos</h2>
                </div>
                
                <div class="subsection">
                    <h3>Conduta com as Crianças</h3>
                    <p>Servir com crianças é uma experiência repleta de alegrias, mas também exige paciência, dedicação e compreensão profunda das necessidades específicas de cada uma.</p>
                </div>

                <div class="subsection">
                    <h3>Como proceder diante do choro?</h3>
                    <p>É crucial manter a paciência, especialmente com crianças de 0 a 3 anos em adaptação.</p>
                    <ul class="styled">
                        <li>Permaneça calmo e remova o bebê da sala para evitar choro coletivo.</li>
                        <li>Faça esforços para acalmar a criança.</li>
                        <li>Se o choro persistir, a supervisão deve contatar os responsáveis.</li>
                        <li><strong>Evite levar a criança ao templo enquanto ela estiver chorando.</strong></li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Uso do Banheiro</h3>
                    <p>A criança deve ser capaz de realizar o procedimento de forma independente.</p>
                    <ul class="styled">
                        <li>Não é permitido prestar assistência para abaixar roupas ou efetuar higiene pessoal.</li>
                        <li>Nossa intervenção limita-se a conduzir a criança até a porta do banheiro.</li>
                        <li>Caso a criança não consiga, contate o responsável para fornecer a assistência.</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Check-in e Saída</h3>
                    <p>Os responsáveis devem retirar uma etiqueta identificadora no totem.</p>
                    <div class="callout warning">
                        <div class="callout-icon">🔒</div>
                        <div class="callout-body">
                            <div class="callout-title">Regra de Segurança</div>
                            <p>A entrega da criança só ocorrerá mediante apresentação da etiqueta do responsável. É estritamente proibido que as crianças deixem o culto sozinhas.</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Permanência de Não Voluntários nas Salas</h3>
                    <p>A permanência nas salas é reservada exclusivamente aos voluntários. Casos excepcionais devem ser comunicados à supervisão.</p>
                    <p><em>Obs: Responsáveis por crianças de 0 a 2 anos têm permissão durante o período de adaptação.</em></p>
                </div>

                <div class="subsection">
                    <h3>Criança muito agitada</h3>
                    <p>Mantenha a serenidade e comunique imediatamente a supervisão.</p>
                    <ul class="styled">
                        <li>A criança será retirada da sala para uma conversa conjunta com a supervisão e outro membro da equipe.</li>
                        <li>O objetivo é acalmá-la para que possa retornar, e não excluí-la.</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Uso de Celular</h3>
                    <div class="callout orange">
                        <div class="callout-icon">📱</div>
                        <div class="callout-body">
                            <div class="callout-title">Atenção Plena</div>
                            <p>É fundamental não utilizar dispositivos celulares durante o culto. O foco deve ser a ministração e o zelo pelo bem-estar das crianças.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SEÇÃO 3 – NOSSOS ESPAÇOS -->
            <section class="section" id="espacos">
                <div class="section-header">
                    <div class="section-num">3</div>
                    <span class="section-icon">📍</span>
                    <h2>Nossos Espaços</h2>
                </div>
                <p>Os espaços do ministério infantil estão distribuídos nos anexos A e B da nossa igreja.</p>

                <div class="card-grid" style="margin-top:24px;">
                    <div class="info-card">
                        <div class="card-title" style="color:var(--orange-dark); font-size:1.1rem; border-bottom:2px solid var(--orange-pale); padding-bottom:8px; margin-bottom:12px;">🏢 Anexo A</div>
                        <ul class="styled" style="background:transparent; border:none; padding:0; gap: 8px;">
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Sala dos Principiantes (3 a 5 anos)</li>
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Sala do Berçário (0 a 2 anos)</li>
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Sala de Amamentação</li>
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Sala de Materiais e Apoio</li>
                        </ul>
                        <img src="/img/anexoA.png" alt="Planta Baixa Anexo A" class="floor-plan">
                    </div>
                    <div class="info-card">
                        <div class="card-title" style="color:var(--orange-dark); font-size:1.1rem; border-bottom:2px solid var(--orange-pale); padding-bottom:8px; margin-bottom:12px;">🏢 Anexo B</div>
                        <ul class="styled" style="background:transparent; border:none; padding:0; gap: 8px;">
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Mini auditório Culto Turma dos Corajosos (6 a 9 anos)</li>
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Sala Calma AME+ KIDS</li>
                            <li style="background:rgba(255,255,255,0.5); border:1px solid var(--orange-pale); padding: 10px 14px;">Ensaio CCA KIDS / Discipulado Infantil</li>
                        </ul>
                        <img src="/img/anexoB.png" alt="Planta Baixa Anexo B" class="floor-plan">
                    </div>
                </div>
            </section>

            <!-- SEÇÃO 4 – CULTO -->
            <section class="section" id="culto">
                <div class="section-header">
                    <div class="section-num">4</div>
                    <span class="section-icon">⛪</span>
                    <h2>Culto</h2>
                </div>
                
                <div class="subsection">
                    <h3>Material Visual e Roteiro</h3>
                    <p>Os roteiros adotados em nossas atividades são os mesmos da PIB Batel e estarão acessíveis durante a semana que precede o domingo. Este material tem todos os elementos necessários para a condução do culto infantil. Caso o professor(a) julgue necessário, há a permissão para ajustes de acordo com as particularidades da faixa etária atendida.</p>
                    <div class="callout info">
                        <div class="callout-icon">🎨</div>
                        <div class="callout-body">
                            <div class="callout-title">Uso de Material Visual</div>
                            <p>Adicionalmente, está disponibilizado um armário, contendo material visual. Este material é elaborado com zelo, carinho e criatividade, portanto, encorajamos sua utilização, pois acreditamos que será um diferencial enriquecedor para as experiências das crianças no culto infantil. Incentivamos o uso, assim como sua manutenção sempre guardando adequadamente ao final do culto infantil.</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Faixas Etárias</h3>
                    <div class="card-grid">
                        <div class="feature-card">
                            <div class="card-icon">👶</div>
                            <h4>Berçário</h4>
                            <p>(0 a 2 anos): Buscamos oferecer ambiente cheio de estímulos para que desde pequenas, as crianças possam despertar o amor à Palavra de Deus.</p>
                        </div>
                        <div class="feature-card">
                            <div class="card-icon">🎨</div>
                            <h4>Principiantes</h4>
                            <p>(3 a 5 anos): Buscamos construir um ambiente de culto, ainda que de maneira lúdica, para ministrar de forma criativa à cada criança introduzindo conceitos de culto e células e a base da fé.</p>
                        </div>
                        <div class="feature-card">
                            <div class="card-icon">🛡️</div>
                            <h4>Corajosos</h4>
                            <p>(6 a 9 anos): Incentivar uma vida corajosa desde cedo de vida diária em Jesus e compartilhamento da Palavra. Em um ambiente real de culto, e incentivando o serviço, a oração e vivência em célula.</p>
                        </div>
                    </div>
                    <div class="callout success" style="margin-top:20px;">
                        <div class="callout-icon">🌈</div>
                        <div class="callout-body">
                            <div class="callout-title">AME+ Kids</div>
                            <p>O ministério infantil tem o compromisso de caminhar em direção a uma cultura de inclusão, acolhendo cada criança com respeito, amor e sensibilidade às suas necessidades individuais. Reconhecemos que entre nós há crianças neurodivergentes, com diferentes formas de aprender, se comunicar e se expressar, e desejamos construir, de forma gradual e responsável, um ambiente seguro onde todas se sintam vistas, amadas e pertencentes.</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Liturgia do Culto Infantil</h3>
                    <p>O culto infantil não é apenas um momento para “entreter” as crianças enquanto os adultos estão no templo. Nosso objetivo é discipular crianças para que elas aprendam desde cedo a participar de um culto de verdade, desenvolvendo intimidade com Deus, comunhão e entendimento da Palavra.</p>

                    <div style="display: flex; gap: 20px; margin: 25px 0; padding: 20px; background: white; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow);">
                        <div style="flex: 1; text-align: center; border-right: 2px solid var(--orange-pale); padding: 10px;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px; font-weight: 800;">🌅 Culto da Manhã</div>
                            <div style="font-size: 1.6rem; font-weight: 900; color: var(--orange-dark); font-family: 'Playfair Display', serif;">10:30 – 12:00</div>
                        </div>
                        <div style="flex: 1; text-align: center; padding: 10px;">
                            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px; font-weight: 800;">🌃 Culto da Noite</div>
                            <div style="font-size: 1.6rem; font-weight: 900; color: var(--orange-dark); font-family: 'Playfair Display', serif;">19:00 – 20:40</div>
                        </div>
                    </div>
                    <p style="font-size: 0.95rem; color: var(--text-soft); font-style: italic; margin-bottom: 30px; text-align: center;">É fundamental manter o ritmo e os horários para que o culto flua de forma organizada, leve e agradável.</p>

                    <div class="liturgy-item">
                        <h4 style="color:var(--orange-dark); margin-bottom:10px;">👶 Berçário</h4>
                        <p>Os professores devem seguir o roteiro de 12 domingos contendo as histórias da criação e seguindo para o conteúdo do Jesus Ama. O roteiro se repete ao finalizar, para garantir que a criança fixe as histórias.</p>
                        <ul class="styled">
                            <li>Todo material está separado e preparado na sala de apoio para ser retirado no momento do culto.</li>
                            <li>A professora deve ler o roteiro, e complementar o conteúdo com músicas e atividades lúdicas.</li>
                            <li>O ensino nessa faixa etário é rápida porém constante no meio das brincadeiras, durante todo o tempo no culto, reforçando e recontando as histórias, fazendo perguntas, envolvendo o tema através do ambiente.</li>
                        </ul>
                    </div>

                    <div class="liturgy-item" style="margin-top:24px;">
                        <h4 style="color:var(--orange-dark); margin-bottom:10px;">🎨 Principiantes</h4>
                        <p>Seguem o roteiro da PIB Batel. Neste roteiro será indicado sempre a faixa etária que os professores devem seguir.</p>
                        <ul class="styled">
                            <li>O voluntário pode acrescentar mais músicas para se tornar uma liturgia mais parecida com o culto dos adultos, ainda que de maneira mais breve.</li>
                            <li><strong>Importante:</strong> é recomendado que os voluntários que atuam nessa turma assistam uma ou duas vezes o culto da turma dos corajosos para buscar implementar tanto quanto for possível a liturgia.</li>
                            <li>É a faixa etária que dá início à transição da criança, onde começamos a aplicar os conceitos de culto para que desde cedo ela se sinta confortável e habituada à liturgia.</li>
                        </ul>
                    </div>

                    <div class="liturgy-item" style="margin-top:24px;">
                        <h4 style="color:var(--orange-dark); margin-bottom:10px;">🛡️ Corajosos</h4>
                        <p>O culto funciona de forma muito semelhante ao culto dos adultos, porém adaptado para a linguagem e realidade das crianças. Nessa faixa etária nosso objetivo deve ser: Orar, Louvar, Ofertar, Ouvir a Palavra, Participar da comunhão, Servir umas às outras e Se envolver em uma célula.</p>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Estrutura do Culto (Corajosos)</h3>
                    <div class="steps-container">
                        <div class="step-item">
                            <div class="step-number">01</div>
                            <div class="step-content">
                                <h4>Recepção e Adaptação (10-15 min)</h4>
                                <p>Momento de acolher as crianças e preparar o ambiente. O objetivo é criar um clima de paz e acolhimento.</p>
                                <ul class="step-list">
                                    <li>Receber com alegria e ajudar na adaptação de quem chegou tímido ou inseguro.</li>
                                    <li>Conversar com as crianças e incentivar a comunhão.</li>
                                    <li>Aos poucos incentivar oração de joelhos.</li>
                                    <li><strong>DICA:</strong> A criança que chegar primeiro pode ser incentivada a ficar na porta recebendo as outras, desenvolvendo responsabilidade e serviço.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">02</div>
                            <div class="step-content">
                                <h4>Abertura com Oração (≈5 min)</h4>
                                <p>Início oficial do culto. Perguntar quem gostaria de orar e escolher uma criança para fazer a oração inicial, incentivando a participação sem pressionar.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">03</div>
                            <div class="step-content">
                                <h4>Louvor Inicial (≈10 min | 2 músicas)</h4>
                                <p>O louvor deve ser participativo, alegre e envolvente.</p>
                                <ul class="step-list">
                                    <li><strong>1ª Música:</strong> Conduzida por um adulto. Preferência por música ao vivo.</li>
                                    <li><strong>2ª Música:</strong> Conduzida por uma criança (definida no domingo anterior).</li>
                                    <li><strong>Repertório:</strong> Evitar músicas excessivamente infantis; as crianças respondem bem às músicas cantadas no culto principal.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">04</div>
                            <div class="step-content">
                                <h4>Momento dos Visitantes (≈5 min)</h4>
                                <p>Identificar quem está vindo pela primeira vez. Pedir para a criança visitante ficar em pé e incentivar as demais a acolherem com abraço e boas-vindas. Cria um ambiente seguro, amoroso e receptivo.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">05</div>
                            <div class="step-content">
                                <h4>Oferta (≈10 min)</h4>
                                <p>Momento da entrega da oferta. As crianças levam os envelopes até a latinha enquanto tocam mais duas músicas de fundo ou adoração.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">06</div>
                            <div class="step-content">
                                <h4>Palavra (15 min)</h4>
                                <p>Tempo que não deve ser reduzido. A mensagem deve ser clara, objetiva, prática e fácil de compreender.</p>
                                <ul class="step-list">
                                    <li>Use exemplos simples e faça perguntas.</li>
                                    <li>Utilize aplicações práticas para o dia a dia.</li>
                                    <li>Mantenha linguagem adequada e evite mensagens excessivamente longas.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">07</div>
                            <div class="step-content">
                                <h4>Última Música (≈5 min)</h4>
                                <p>Momento final de adoração e encerramento da ministração da Palavra.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">08</div>
                            <div class="step-content">
                                <h4>Oração Final (≈5 min)</h4>
                                <p>Encerramento oficial do culto orando em unidade com todas as crianças.</p>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">09</div>
                            <div class="step-content">
                                <h4>Pós-Culto: Célula (15-20 min)</h4>
                                <p>Divisão entre meninos e meninas para um tempo de pastoreio e compartilhamento.</p>
                                <ul class="step-list">
                                    <li><strong>Meninos (Corajosos e Valentes):</strong> Resp. Jonathas.</li>
                                    <li><strong>Meninas (Corajosas e Amigas de Deus):</strong> Resp. Rebekah.</li>
                                    <li>Trabalhar de 1 a 3 perguntas sobre a Palavra e coletar pedidos de oração.</li>
                                </ul>
                            </div>
                        </div>

                        <div class="step-item">
                            <div class="step-number">10</div>
                            <div class="step-content">
                                <h4>Atividade Extra</h4>
                                <p>Caso sobre tempo até a chegada dos pais, realizar atividades leves como desenhos, brincadeiras simples ou conversas supervisionadas.</p>
                            </div>
                        </div>
                    </div>
                </div>



                <div class="subsection">
                    <h3>Princípios Importantes</h3>
                    <ul class="styled">
                        <li><strong>Organização:</strong> Tudo deve acontecer com leveza, mas com direção.</li>
                        <li><strong>Participação:</strong> As crianças não são espectadoras. Elas participam ativamente do culto.</li>
                        <li><strong>Ambiente seguro:</strong> Criar um ambiente acolhedor, alegre e respeitoso.</li>
                        <li><strong>Intencionalidade:</strong> Cada momento do culto possui propósito espiritual.</li>
                        <li><strong>Amor e paciência:</strong> Estamos discipulando crianças. O processo acontece aos poucos.</li>
                    </ul>
                    <div class="golden-rule" style="background:var(--orange-dark); margin-top:24px;">
                        <div class="rule-title">🎯 NOSSO OBJETIVO FINAL</div>
                        <p style="font-size:1.4rem; text-align:center; font-weight:700; color:white; padding:10px 0;">
                            “LEVAR AS CRIANÇAS A UM RELACIONAMENTO INTENSO COM DEUS.”
                        </p>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Controle de Chaves</h3>
                    <p>O gerenciamento das chaves é fundamental para a segurança e organização do nosso espaço.</p>
                    <ul class="styled">
                        <li>Todas as chaves do ministério infantil ficam guardadas na sala de apoio ao lado da amamentação. Esta sala deve permanecer trancada.</li>
                        <li>Cada supervisor possui uma cópia da chave da sala de apoio e é responsável por abrir a sala para os demais voluntários.</li>
                        <li>As chaves do infantil não devem ser emprestadas ou compartilhadas. A supervisão do dia abre as salas e armários e permanece com as chaves do Anexo A.</li>
                        <li>Sobre as chaves do Anexo B, a supervisão no início do culto entrega as chaves dos armários de materiais ao professor do culto e as chaves dos 
                            armários da sala calma para o voluntário da inclusão infantil.
                        </li>
                        <li>Ao final do culto, a supervisão deve conferir se todas as chaves foram devolvidas, e se armários estão devidamente trancados. Então deve guardar as chaves na sala de apoio e trancar a porta.</li>
                    </ul>
                </div>
            </section>

            <!-- SEÇÃO 5 – SISTEMA & MATERIAIS -->
            <section class="section" id="totem">
                <div class="section-header">
                    <div class="section-num">5.1</div>
                    <span class="section-icon">🖥️</span>
                    <h2>Totem do Ministério Infantil</h2>
                </div>
                <p>O totem é o sistema de check-in e identificação das crianças. É fundamental que todos os voluntários
                    saibam operá-lo corretamente.</p>

                <div class="subsection">
                    <h3>Como Ligar o Totem</h3>
                    <ul class="styled">
                        <li>Localize o botão de energia na parte traseira ou lateral do equipamento</li>
                        <li>Pressione e aguarde a inicialização completa (pode levar alguns minutos)</li>
                        <li>Confirme que a tela inicial de check-in está visível</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Como Trocar a Etiqueta</h3>
                    <ul class="styled">
                        <li>Abra o compartimento de etiquetas conforme instruções do equipamento</li>
                        <li>Insira o novo rolo de etiqueta conforme o vídeo de treinamento</li>
                        <li>Faça um teste de impressão para confirmar o funcionamento</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>O Que Fazer se o Totem Não Funcionar</h3>
                    <ol class="styled">
                        <li>Reinicie o equipamento (desligue e ligue novamente)</li>
                        <li>Se o problema persistir, avise imediatamente a liderança</li>
                        <li>Registre as crianças manualmente enquanto o problema é resolvido</li>
                        <li>Comunique a secretária para que ela acione o suporte técnico responsável se necessário</li>
                    </ol>
                </div>

                <div class="subsection">
                    <h3>Cadastro de Novas Crianças</h3>
                    <ul class="styled">
                        <li>Acesse o menu de cadastro no painel administrativo do totem</li>
                        <li>Preencha: nome completo, data de nascimento, responsável e contato</li>
                        <li>Confirme o cadastro e gere a primeira etiqueta de identificação</li>
                        <li>Entregue uma cópia da etiqueta ao responsável</li>
                    </ul>
                </div>
            </section>

            <section class="section" id="etiquetas">
                <div class="section-header">
                    <div class="section-num">5.2</div>
                    <span class="section-icon">🏷️</span>
                    <h2>Falta de Etiquetas</h2>
                </div>
                <p>As etiquetas são essenciais para o check-in das crianças. Quando perceber que o estoque está baixo,
                    siga este protocolo:</p>

                <table class="checklist-table" style="margin-top:16px;">
                    <thead>
                        <tr>
                            <th>Passo</th>
                            <th>Ação</th>
                            <th>Observação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span
                                    style="background:var(--orange);color:white;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;">1</span>
                            </td>
                            <td><span class="step-label">Verificar no armário de materiais do ministério</span></td>
                            <td><span class="step-timing">Primeiro passo</span></td>
                        </tr>
                        <tr>
                            <td><span
                                    style="background:var(--orange);color:white;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;">2</span>
                            </td>
                            <td><span class="step-label">Se não houver estoque, avisar a liderança imediatamente</span>
                            </td>
                            <td><span class="step-timing">Não espere o dia do culto</span></td>
                        </tr>
                        <tr>
                            <td><span
                                    style="background:var(--orange);color:white;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;">3</span>
                            </td>
                            <td><span class="step-label">A liderança solicitará à secretária Priscila</span>
                                <div class="step-note">Priscila abrirá a solicitação</div>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><span
                                    style="background:var(--orange);color:white;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:900;">4</span>
                            </td>
                            <td><span class="step-label">Secretária solicita ao Setor de Tecnologia</span>
                                <div class="step-note">Setor de Tecnologia lá do Batel que dá suporte aos campus</div>
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>

                <div class="callout warning" style="margin-top:16px;">
                    <div class="callout-icon">⚠️</div>
                    <div class="callout-body">
                        <div class="callout-title">Não Espere Acabar!</div>
                        <p>Ao perceber que o estoque está baixo, já avise. Mantenha sempre pelo menos um rolo extra no
                            armário como estoque de segurança.</p>
                    </div>
                </div>
            </section>

            <section class="section" id="materiais">
                <div class="section-header">
                    <div class="section-num">5.3</div>
                    <span class="section-icon">🗂️</span>
                    <h2>Materiais do Ministério Infantil</h2>
                </div>
                <p>Todos os materiais do ministério têm um local definido. Conhecer e respeitar essa organização é
                    fundamental para que tudo funcione bem.</p>

                <div class="subsection">
                    <h3>Localização dos Materiais</h3>
                    <ul class="styled">
                        <li>Materiais de uso geral estão nos armários indicados pela liderança</li>
                        <li>Existe uma área exclusiva da supervisão — não acesse sem autorização</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Boas Práticas com os Materiais</h3>
                    <ul class="styled">
                        <li>Antes de pegar qualquer material, verifique se pertence ao ministério infantil</li>
                        <li>Nunca pegue materiais de outros ministérios sem autorização</li>
                        <li>Se um material acabar ou quebrar, avise imediatamente a liderança</li>
                        <li>Mantenha os armários organizados após o uso</li>
                    </ul>
                </div>

                <div class="golden-rule">
                    <div class="rule-title">📦 REGRA DE OURO DOS MATERIAIS</div>
                    <p>Todo material utilizado deve ser devolvido exatamente no mesmo lugar onde foi
                        encontrado.<br><br>Isso vale para: tesouras, fitas, papéis, canetas, decorações, toalhas,
                        utensílios de cozinha e qualquer outro item do ministério.<br><br><strong
                            style="color:rgba(255,255,255,0.9)">Se usou → devolveu. Simples assim.</strong></p>
                </div>
            </section>

            <!-- SEÇÃO 6 – EVENTOS -->
            <section class="section" id="eventos">
                <div class="section-header">
                    <div class="section-num">6.1</div>
                    <span class="section-icon">🎉</span>
                    <h2>Organização de Eventos</h2>
                </div>

                <div class="subsection">
                    <h3>Aprovação do Evento</h3>
                    <p>Todo evento deve ser <strong>aprovado pela liderança do ministério</strong> antes de qualquer
                        planejamento, divulgação ou reserva. Isso garante alinhamento com o calendário da igreja e os
                        objetivos do ministério.</p>
                    <div class="callout warning">
                        <div class="callout-icon">⚠️</div>
                        <div class="callout-body">
                            <div class="callout-title">Atenção</div>
                            <p>Não comunique datas nem divulgue eventos antes da aprovação formal da liderança.
                                Reservas, compras e convites só devem ser iniciados após a aprovação.</p>
                        </div>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Reserva de Salas</h3>
                    <p>A reserva deve ser feita junto à secretária da igreja, <strong>Priscila</strong>.</p>
                    <div class="deadline">📅 Mínimo 15 dias de antecedência</div>
                    <p style="margin-top:12px;">Informações obrigatórias na reserva:</p>
                    <ul class="styled">
                        <li>Qual sala será utilizada</li>
                        <li>Horário de entrada</li>
                        <li>Horário de saída</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Organização Pós-Evento</h3>
                    <p>A sala deve ser devolvida <strong>exatamente como foi encontrada</strong>. Essa é uma
                        responsabilidade coletiva da equipe.</p>
                    <ul class="styled">
                        <li>Recolher e guardar todos os materiais utilizados</li>
                        <li>Devolver cadeiras, mesas e equipamentos ao local original</li>
                        <li>Verificar se não ficou nenhum item esquecido</li>
                        <li>Apagar as luzes e fechar as portas</li>
                    </ul>
                </div>
            </section>

            <section class="section" id="mesas">
                <div class="section-header">
                    <div class="section-num">6.2</div>
                    <span class="section-icon">🪑</span>
                    <h2>Reserva de Mesas e Toalhas</h2>
                </div>
                <p>Quando o evento precisar de mesas ou toalhas de mesa, é obrigatório incluir essa informação no
                    momento da reserva com a secretária.</p>

                <div class="subsection">
                    <h3>Reserva de Mesas</h3>
                    <ul class="styled">
                        <li>Informar a quantidade exata de mesas necessárias</li>
                        <li>Especificar o formato de disposição (fileiras, ilhas, em U etc.), se necessário</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Reserva de Toalhas</h3>
                    <ul class="styled">
                        <li>Solicitar as toalhas junto com a reserva da sala</li>
                        <li>Confirmar a quantidade conforme o número de mesas</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Devolução de Mesas e Toalhas</h3>
                    <ul class="styled">
                        <li>Desmontar todas as mesas utilizadas</li>
                        <li>Devolver as mesas no local indicado</li>
                        <li>Sacudir as toalhas para remover resíduos e migalhas</li>
                        <li>Colocar as toalhas para lavar no local indicado na reserva</li>
                    </ul>
                    <div class="callout orange">
                        <div class="callout-icon">🔑</div>
                        <div class="callout-body">
                            <div class="callout-title">Dica de Ouro</div>
                            <p>Sempre confirme com a secretária o local correto de devolução. Cada evento pode ter
                                orientações específicas de logística.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section" id="cozinha">
                <div class="section-header">
                    <div class="section-num">6.3</div>
                    <span class="section-icon">🍽️</span>
                    <h2>Uso da Cozinha</h2>
                </div>
                <p>O uso da cozinha requer <strong>reserva prévia junto à secretária</strong>. A reserva deve ser feita
                    com a mesma antecedência das demais reservas de espaço.</p>

                <div class="subsection">
                    <h3>Como Reservar a Cozinha</h3>
                    <ul class="styled">
                        <li>Entre em contato com a secretária Priscila</li>
                        <li>Informe a data e o horário de uso</li>
                        <li>Liste os utensílios que serão utilizados (panelas, talheres, formas etc.)</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Regras de Uso — Obrigatório ao Terminar</h3>
                    <ul class="styled">
                        <li>Lavar toda a louça e utensílios utilizados</li>
                        <li>Guardar os utensílios nos locais corretos</li>
                        <li>Limpar bancada e fogão</li>
                        <li>Organizar o espaço exatamente como estava antes</li>
                    </ul>
                    <div class="callout success">
                        <div class="callout-icon">🍽️</div>
                        <div class="callout-body">
                            <div class="callout-title">Boas Práticas na Cozinha</div>
                            <p>Deixe o espaço mais limpo do que você encontrou. Se algo quebrar ou acabar (papel toalha,
                                detergente), avise a secretária. Não utilize itens de outros ministérios sem
                                autorização.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section" id="som">
                <div class="section-header">
                    <div class="section-num">6.4</div>
                    <span class="section-icon">🎤</span>
                    <h2>Uso do Sistema de Som e Audiovisual</h2>
                </div>
                <p>Se o evento precisar de microfone, caixas de som, projetor ou qualquer recurso audiovisual, é
                    necessário comunicar o <strong>Ministério de Som e Adoração</strong> com antecedência.</p>

                <div class="subsection">
                    <h3>Como Solicitar</h3>
                    <ul class="styled">
                        <li>Identifique com clareza quais equipamentos serão necessários</li>
                        <li>Entre em contato com o líder do Ministério de Som e Adoração</li>
                        <li>Informe a data, horário e local do evento</li>
                        <li>Confirme a disponibilidade dos equipamentos e da equipe</li>
                    </ul>
                    <div class="callout warning">
                        <div class="callout-icon">🎤</div>
                        <div class="callout-body">
                            <div class="callout-title">Importante</div>
                            <p>Não opere equipamentos de som sem autorização ou treinamento. Avise com o máximo de
                                antecedência possível para que a equipe possa se organizar.</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SEÇÃO 6.5 – CHECKLIST -->
            <section class="section" id="checklist">
                <div class="section-header">
                    <div class="section-num">6.5</div>
                    <span class="section-icon">✅</span>
                    <h2>Checklist para Eventos</h2>
                </div>
                <p>Use esta lista antes, durante e depois de cada evento. Clique nas caixas para marcar cada etapa
                    concluída!</p>

                <div class="checklist-toolbar">
                    <button class="btn-print" onclick="printChecklist()">🖨️ Imprimir Checklist</button>
                </div>

                <table class="checklist-table">
                    <thead>
                        <tr>
                            <th>✓</th>
                            <th>Etapa</th>
                            <th>Prazo / Observação</th>
                        </tr>
                    </thead>
                    <tbody id="checklist-body"></tbody>
                </table>

                <div class="callout info">
                    <div class="callout-icon">💡</div>
                    <div class="callout-body">
                        <div class="callout-title">Dica</div>
                        <p>Clique nas caixas de seleção para acompanhar o progresso do seu evento. O checklist reinicia
                            ao recarregar a página.</p>
                    </div>
                </div>
            </section>

            <!-- SEÇÃO 7 – COMPRAS & LOGÍSTICA -->
            <section class="section" id="lanche">
                <div class="section-header">
                    <div class="section-num">7.1</div>
                    <span class="section-icon">☕</span>
                    <h2>Café ou Lanche em Eventos</h2>
                </div>
                <p>Quando o evento incluir lanche ou café, o pedido deve ser feito através da secretária.</p>
                <div class="deadline">📅 Mínimo 15 dias de antecedência</div>

                <div class="subsection" style="margin-top:20px;">
                    <h3>Informações Obrigatórias no Pedido</h3>
                    <ul class="styled">
                        <li>Quantidade de itens (número de porções ou pessoas)</li>
                        <li>Especificação detalhada do que será servido</li>
                        <li>Data de entrega</li>
                        <li>Horário de entrega</li>
                        <li>Nome do responsável por receber o pedido</li>
                    </ul>
                </div>

                <div class="example-box">
                    <p><strong>"Solicito para o dia 15/06, até as 9h, no salão principal:</strong><br>
                        — 50 pãezinhos de queijo<br>
                        — 2 caixas de suco de uva (caixinha 200ml)<br>
                        — 50 copos descartáveis<br>
                        <strong>Responsável pelo recebimento: Maria (tel. 99999-9999)"</strong>
                    </p>
                </div>
            </section>

            <section class="section" id="cantina">
                <div class="section-header">
                    <div class="section-num">7.2</div>
                    <span class="section-icon">🛒</span>
                    <h2>Cantina do Ministério Infantil</h2>
                </div>
                <p>A cantina é uma importante atividade do ministério. Siga todas as etapas abaixo para que tudo ocorra
                    sem imprevistos.</p>

                <div class="subsection">
                    <h3>Planejamento da Cantina</h3>
                    <ul class="styled">
                        <li>Definir a data e aprovar com a liderança</li>
                        <li>Informar a secretária Priscila sobre a data</li>
                        <li>Fazer pedido de compras com mínimo 15 dias de antecedência</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Pedido de Produtos — Seja Preciso!</h3>
                    <div class="example-box">
                        <p><strong>"100 coxinhas de frango com catupiry — tamanho médio"</strong><br>
                            <strong>"50 latinhas: 25 Coca-Cola e 25 Guaraná"</strong>
                        </p>
                    </div>
                </div>

                <div class="subsection">
                    <h3>Itens de Apoio — Verifique Também</h3>
                    <ul class="styled">
                        <li>Copos descartáveis</li>
                        <li>Guardanapos</li>
                        <li>Sacolas para embalagem</li>
                        <li>Troco para vendas (solicitar à secretária com antecedência)</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Reservas Necessárias para a Cantina</h3>
                    <ul class="styled">
                        <li>Reservar a cozinha (ver Seção 5)</li>
                        <li>Reservar as mesas necessárias (ver Seção 4)</li>
                    </ul>
                    <div class="callout warning">
                        <div class="callout-icon">💰</div>
                        <div class="callout-body">
                            <div class="callout-title">Troco e Vendas</div>
                            <p>Solicite o troco à secretária com pelo menos 7 dias de antecedência. Defina os preços
                                antecipadamente e designe uma pessoa específica para o caixa — isso evita confusões na
                                hora da venda.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section" id="compras">
                <div class="section-header">
                    <div class="section-num">7.3</div>
                    <span class="section-icon">📦</span>
                    <h2>Pedidos de Compras</h2>
                </div>
                <p>Todo pedido de compra deve ser encaminhado à secretária com todas as informações necessárias.</p>
                <div class="deadline">📅 Mínimo 15 dias de antecedência</div>

                <div class="subsection" style="margin-top:20px;">
                    <h3>Informações Obrigatórias</h3>
                    <ul class="styled">
                        <li>Nome completo do produto</li>
                        <li>Quantidade desejada</li>
                        <li>Descrição clara e detalhada do item</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Informações Complementares (Muito Recomendadas)</h3>
                    <ul class="styled">
                        <li>Imagem de referência do produto</li>
                        <li>Link do produto (ex: Mercado Livre, Amazon)</li>
                        <li>Valor médio de mercado</li>
                    </ul>
                    <div class="callout info">
                        <div class="callout-icon">🛒</div>
                        <div class="callout-body">
                            <div class="callout-title">Por que incluir link e valor?</div>
                            <p>Com link e foto, quem comprar saberá exatamente o que adquirir. Indicar o valor ajuda no
                                planejamento financeiro do ministério. Pedidos incompletos ou fora do prazo podem
                                atrasar a entrega.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section" id="lembrancas">
                <div class="section-header">
                    <div class="section-num">7.4</div>
                    <span class="section-icon">🎁</span>
                    <h2>Lembrancinhas para as Crianças</h2>
                </div>
                <p>Quando o evento incluir lembrancinhas, o pedido deve ser feito com bastante antecedência.</p>
                <div class="deadline">🎁 Mínimo 30 dias de antecedência</div>

                <div class="subsection" style="margin-top:20px;">
                    <h3>Informações do Pedido</h3>
                    <ul class="styled">
                        <li>Quantidade (baseada no número esperado de crianças)</li>
                        <li>Descrição detalhada do item</li>
                        <li>Referência visual (foto, link ou modelo)</li>
                    </ul>
                    <div class="callout orange">
                        <div class="callout-icon">🎁</div>
                        <div class="callout-body">
                            <div class="callout-title">Boas Práticas para Lembrancinhas</div>
                            <p>Considere sempre um excedente de 10–15% para imprevistos. Verifique se a lembrancinha é
                                adequada para a faixa etária. Para datas especiais (Páscoa, Natal), planeje com ainda
                                mais antecedência!</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- SEÇÃO 8 – COMUNICAÇÃO -->
            <section class="section" id="divulgacao">
                <div class="section-header">
                    <div class="section-num">8.1</div>
                    <span class="section-icon">📢</span>
                    <h2>Divulgação de Eventos</h2>
                </div>
                <p>A divulgação é de responsabilidade da <strong>equipe de comunicação</strong>. O
                    ministério deve preparar o material e enviá-lo para o líder do ministério de comunicação conforme as orientações abaixo.</p>

                <div class="subsection">
                    <h3>Canais de Divulgação</h3>
                    <ul class="styled">
                        <li>Instagram da igreja</li>
                        <li>Avisos durante o culto</li>
                        <li>Outros canais definidos pela equipe de comunicação</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Como Enviar o Material</h3>
                    <ul class="styled">
                        <li>Entre em contato com o líder do ministério de comunicação</li>
                        <li>Verifique o formato correto para cada canal (tamanho de imagem, texto etc.)</li>
                        <li>Envie o material com prazo suficiente para edição e aprovação</li>
                        <li>Confirme o agendamento da publicação</li>
                    </ul>
                </div>

                <div class="subsection">
                    <h3>Fotos do Evento</h3>
                    <div class="callout info">
                        <div class="callout-icon">📸</div>
                        <div class="callout-body">
                            <div class="callout-title">Cobertura Fotográfica</div>
                            <p>Se o evento precisar de fotos, a solicitação também deve ser feita à equipe de
                                comunicação. A equipe irá designar um fotógrafo responsável. Faça a solicitação junto
                                com o pedido de divulgação, com antecedência.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section" id="equipe">
                <div class="section-header">
                    <div class="section-num">8.2</div>
                    <span class="section-icon">👥</span>
                    <h2>Equipe do Evento</h2>
                </div>
                <p>Todo evento deve contar com uma equipe responsável e organizada. A divisão clara de funções é
                    essencial para que tudo corra bem.</p>

                <div class="timeline">
                    <div class="timeline-phase">
                        <div class="timeline-phase-title">⏰ Antes do Evento</div>
                        <ul>
                            <li>Conferir lista de materiais</li>
                            <li>Preparar e organizar o espaço</li>
                            <li>Verificar reservas confirmadas</li>
                            <li>Montar mesas e decoração</li>
                        </ul>
                    </div>
                    <div class="timeline-phase">
                        <div class="timeline-phase-title">🎯 Durante o Evento</div>
                        <ul>
                            <li>Receber crianças e famílias</li>
                            <li>Garantir segurança e organização</li>
                            <li>Apoiar a logística</li>
                            <li>Gerenciar imprevistos</li>
                        </ul>
                    </div>
                    <div class="timeline-phase">
                        <div class="timeline-phase-title">✅ Após o Evento</div>
                        <ul>
                            <li>Recolher e guardar materiais</li>
                            <li>Desmontar e devolver mesas</li>
                            <li>Organizar o espaço</li>
                            <li>Conferir itens esquecidos</li>
                        </ul>
                    </div>
                </div>

                <div class="callout success">
                    <div class="callout-icon">👥</div>
                    <div class="callout-body">
                        <div class="callout-title">Dica de Liderança</div>
                        <p>Defina responsáveis específicos para cada etapa antes do evento. Uma reunião rápida de
                            briefing alinha a equipe e evita esquecimentos. Após o evento, um agradecimento à equipe faz
                            toda a diferença no engajamento!</p>
                </div>
            </section>

            <!-- SEÇÃO 9 – CALENDÁRIO -->
            <section class="section" id="calendario">
                <div class="section-header">
                    <div class="section-num">9</div>
                    <span class="section-icon">📅</span>
                    <h2>Calendário de Eventos</h2>
                </div>
                <p>Mantenha-se atualizado com as datas e horários de todas as nossas atividades e treinamentos:</p>
                <img src="/img/calendario.png" alt="Calendário de Eventos" class="floor-plan">
            </section>

            <!-- SEÇÃO 10 – ORGANOGRAMA -->
            <section class="section" id="organograma">
                <div class="section-header">
                    <div class="section-num">10</div>
                    <span class="section-icon">📊</span>
                    <h2>Organograma</h2>
                </div>
                <p>Confira abaixo a estrutura organizacional do nosso ministério:</p>
                <img src="/img/organograma.png" alt="Organograma do Ministério" class="floor-plan">
            </section>

            <!-- SEÇÃO 11 – CONTATOS -->
            <section class="section" id="contatos">
                <div class="section-header">
                    <div class="section-num">11</div>
                    <span class="section-icon">📞</span>
                    <h2>Contatos</h2>
                </div>
                <p>Precisa de ajuda ou informações? Entre em contato com os responsáveis:</p>

                <div class="card-grid" style="margin-top:24px;">
                    <!-- Base Campus -->
                    <div class="info-card">
                        <div class="card-icon">🏢</div>
                        <div class="card-title">ABASC Campo Comprido</div>
                        <p style="margin-bottom:8px;">Ação social, projetos e atendimentos sociais.</p>
                        <p><strong>(41) 99236-9035</strong></p>
                        <a href="https://wa.me/5541992369035" target="_blank" class="btn-whatsapp">
                            <span>WhatsApp</span>
                        </a>
                    </div>

                    <!-- Secretaria -->
                    <div class="info-card">
                        <div class="card-icon">📅</div>
                        <div class="card-title">Secretaria</div>
                        <p style="margin-bottom:8px;">Informações sobre o Campus, reservas e agendamentos.</p>
                        <p><strong>(41) 99129-8050</strong></p>
                        <a href="https://wa.me/5541991298050" target="_blank" class="btn-whatsapp">
                            <span>WhatsApp</span>
                        </a>
                    </div>
                </div>
            </section>

            <!-- ENCERRAMENTO -->
            <section class="section" style="text-align:center; padding:40px 0;">
                <div style="font-size:2.5rem; margin-bottom:16px;">✦ ✦ ✦</div>
                <h2
                    style="font-family:'Playfair Display',serif; font-size:1.8rem; color:var(--orange-dark); margin-bottom:12px;">
                    Obrigado por fazer parte do<br>Start!</h2>
                <p style="font-size:1.05rem; max-width:480px; margin:0 auto 16px; color:var(--text-soft);">Cada detalhe
                    que você cuida faz diferença na vida de uma criança. Servir com excelência é a nossa oferta a Deus.
                </p>
                <p style="font-style:italic; color:var(--text-muted); font-size:0.9rem;">"Porque onde estiver o vosso
                    tesouro, aí estará também o vosso coração." — Mateus 6:21</p>
            </section>

        </div><!-- /content -->

        <!-- FOOTER -->
        <footer class="page-footer">
            <div class="footer-logo"><img src="/img/LOGO START BRANCA PNG.png" alt="Start" style="height:32px;display:block;margin:0 auto;"></div>
            <p class="footer-verse">"...sempre abundantes na obra do Senhor..." — 1 Coríntios 15:58</p>
            <p>PIB Curitiba · Campus Campo Comprido &nbsp;·&nbsp; Manual do Voluntário 2026</p>
        </footer>

    </main>

    <!-- Modal Container -->
    <div id="imageModal" class="image-modal">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <img class="modal-content" id="modalImg">
    </div>
`;
