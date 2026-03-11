/**
 * E-SESMT - Script Unificado v2.0
 * Integração: Cards Interativos, WhatsApp Business, Acessibilidade e Validação
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. CONFIGURAÇÕES TÉCNICAS E SELETORES ---
  const numeroWhatsApp = '5531984586788';
  const body = document.body;
  
  // Seletores de Menu e UI
  const menuToggle = document.getElementById('menu-toggle');
  const mainNav = document.getElementById('main-nav');
  const scrollBtn = document.getElementById('scroll-to-top');
  
  // Seletores de Acessibilidade
  const acessibilidadeBtn = document.getElementById('btn-acessibilidade');
  const acessibilidadePanel = document.getElementById('accessibility-panel');
  const contrastBtn = document.getElementById('toggle-contrast');
  const fontsizeBtn = document.getElementById('toggle-fontsize');
  
  // Seletores de Formulários
  const agendamentoForm = document.getElementById('agendamento-form');
  const contatoForm = document.getElementById('contato-form');
  const tabBtns = document.querySelectorAll('.tab-btn');
  
  // --- 2. LÓGICA DE NAVEGAÇÃO E MENU MOBILE ---
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function() {
      const active = mainNav.classList.toggle('active');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', active);
    });
    
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.header') && mainNav.classList.contains('active')) {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  }
  
  // --- 3. ACESSIBILIDADE E PERSISTÊNCIA ---
  const updateAccessibility = (key, btn, className) => {
    const state = localStorage.getItem(key) === 'true';
    if (btn) btn.checked = state;
    if (state) body.classList.add(className);
    
    if (btn) {
      btn.addEventListener('change', function() {
        body.classList.toggle(className, this.checked);
        localStorage.setItem(key, this.checked);
      });
    }
  };
  
  updateAccessibility('contrast', contrastBtn, 'high-contrast');
  updateAccessibility('fontsize', fontsizeBtn, 'large-font');
  
  if (acessibilidadeBtn) {
    acessibilidadeBtn.addEventListener('click', () => {
      acessibilidadePanel.hidden = !acessibilidadePanel.hidden;
    });
  }
  
  // --- 4. TROCA DE ABAS (AGENDAMENTO VS CONTATO) ---
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      
      document.querySelectorAll('.tab-content').forEach(content => {
        content.hidden = (content.id !== tabId);
        if (content.id === tabId) content.classList.add('active');
      });
      
      const feedback = document.getElementById('form-feedback');
      if (feedback) feedback.hidden = true;
    });
  });
  
  // --- 5. LÓGICA DE AGENDAMENTO E WHATSAPP ---
  if (agendamentoForm) {
    agendamentoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const dataInput = document.getElementById('data');
      if (!dataInput.value) {
        mostrarMensagem('error', 'Selecione uma data para o agendamento.');
        return;
      }
      
      const dataEscolhida = new Date(dataInput.value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      if (dataEscolhida < hoje) {
        mostrarMensagem('error', 'Por favor, escolha uma data futura!');
        return;
      }
      
      // Se houver seleção de horários específica
      const containerHorarios = document.getElementById('horarios-container');
      if (containerHorarios) {
        containerHorarios.hidden = false;
        containerHorarios.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Se não houver container de horários, envia direto
        enviarParaWhatsApp('agendamento');
      }
    });
    
    // Listeners para botões de horários específicos (se existirem)
    document.querySelectorAll('.horario-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        enviarParaWhatsApp('agendamento', this.getAttribute('data-horario'));
      });
    });
  }
  
  // --- 6. ENVIO DE CONTATO DIRETO ---
  if (contatoForm) {
    contatoForm.addEventListener('submit', function(e) {
      e.preventDefault();
      enviarParaWhatsApp('contato');
    });
  }
  
  // Função Mestra de Envio
  function enviarParaWhatsApp(tipo, horario = null) {
    let texto = "";
    
    if (tipo === 'agendamento') {
      const dados = {
        nome: document.getElementById('nome').value,
        empresa: document.getElementById('empresa')?.value || 'Não informada',
        servico: document.getElementById('servico').value,
        data: formatarData(document.getElementById('data').value),
        msg: document.getElementById('mensagem')?.value || 'Sem observações'
      };
      
      texto = `🎯 *NOVO AGENDAMENTO*%0A%0A👤 *Nome:* ${dados.nome}%0A🏢 *Empresa:* ${dados.empresa}%0A🛡️ *Serviço:* ${dados.servico}%0A📅 *Data:* ${dados.data}`;
      if (horario) texto += `%0A⏰ *Horário:* ${horario}`;
      texto += `%0A💬 *Obs:* ${dados.msg}`;
      
    } else {
      const nome = document.getElementById('contato-nome').value;
      const msg = document.getElementById('contato-mensagem').value;
      texto = `📨 *CONTATO DIRETO*%0A%0A👤 *Nome:* ${nome}%0A💬 *Mensagem:* ${msg}`;
    }
    
    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, '_blank');
    mostrarMensagem('success', 'Redirecionando para o WhatsApp...');
  }
  
  // --- 7. UTILITÁRIOS ---
  
  // Máscara de Telefone (Ex: (31) 98458-6788)
  document.querySelectorAll('[data-mask="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      let v = e.target.value.replace(/\D/g, '');
      v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
      v = v.replace(/(\d{5})(\d)/, '$1-$2');
      e.target.value = v.substring(0, 15);
    });
  });
  
  function formatarData(data) {
    if (!data) return "";
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  
  function mostrarMensagem(tipo, texto) {
    const feedback = document.getElementById('form-feedback');
    if (feedback) {
      feedback.innerHTML = `<span>${texto}</span>`;
      feedback.className = `form-feedback form-feedback--${tipo}`;
      feedback.hidden = false;
      setTimeout(() => feedback.hidden = true, 5000);
    }
  }
  
  // Scroll to Top visibility
  window.addEventListener('scroll', () => {
    if (scrollBtn) scrollBtn.style.display = window.scrollY < 300 ? 'none' : 'flex';
  });
  
  // AOS - Observer de Animação
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('[data-aos]').forEach(el => observer.observe(el));
  
  console.log('✓ E-SESMT: Sistema unificado e pronto.');
});

/**
 * Função Global para os Cards de Serviços
 * Colocada fora para ser acessível pelo atributo 'onclick' do HTML
 */
function toggleCard(element) {
  const isOpening = !element.classList.contains('active');
  
  // Fecha todos os cards para manter foco único
  document.querySelectorAll('.servico-card').forEach(card => {
    card.classList.remove('active');
    const cardBtn = card.querySelector('.btn-saiba-mais');
    if (cardBtn) cardBtn.innerText = "Ver detalhes";
  });
  
  if (isOpening) {
    element.classList.add('active');
    element.querySelector('.btn-saiba-mais').innerText = "Fechar";
    
    // Scroll suave para o card aberto em telas menores
    if (window.innerWidth < 768) {
      setTimeout(() => {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  }
}
