const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

$('#year').textContent = new Date().getFullYear();

const menu = $('.menu-toggle');
const nav = $('#site-nav');
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', open);
});
$$('.site-nav a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));

function openModal(id) {
  const modal = $('#' + id);
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  const first = $('input, select, textarea, button', modal);
  if (first) first.focus();
}
function closeModal(modal) {
  modal.hidden = true;
  document.body.style.overflow = '';
}
$$('.js-book').forEach(button => button.addEventListener('click', () => openModal('booking-modal')));
$$('.js-enquire').forEach(button => button.addEventListener('click', () => openModal('enquiry-modal')));
$$('.modal-close').forEach(button => button.addEventListener('click', () => closeModal(button.closest('.modal-backdrop'))));
$$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(backdrop); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') $$('.modal-backdrop').filter(m => !m.hidden).forEach(closeModal); });

const dateInput = $('#date');
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split('T')[0];
dateInput.min = localDate;
dateInput.addEventListener('input', () => {
  if (dateInput.value && new Date(`${dateInput.value}T00:00:00`).getDay() % 6 === 0) {
    dateInput.setCustomValidity('Please choose a weekday. The practice is closed on weekends.');
  } else dateInput.setCustomValidity('');
});
const timeSelect = $('select[name="time"]');
for (let hour = 8; hour < 16; hour++) {
  for (const minute of [0, 30]) {
    const h = hour > 12 ? hour - 12 : hour;
    const suffix = hour < 12 ? 'am' : 'pm';
    const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    timeSelect.add(new Option(`${h}:${String(minute).padStart(2, '0')} ${suffix}`, value));
  }
}

const paymentRadios = $$('input[name="payment"]');
const aidFields = $('#medical-aid-fields');
const scheme = $('input[name="scheme"]');
const medicalNumber = $('input[name="medicalNumber"]');
paymentRadios.forEach(radio => radio.addEventListener('change', () => {
  const aid = radio.value === 'Medical Aid' && radio.checked;
  aidFields.hidden = !aid;
  scheme.required = aid;
  medicalNumber.required = aid;
}));

function submitMail(form, subject, status) {
  const data = new FormData(form);
  const lines = [...data.entries()].filter(([key]) => !['submit'].includes(key)).map(([key, value]) => `${key}: ${value || 'Not provided'}`);
  const body = lines.join('\n');
  window.location.href = `mailto:drtgndou@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  status.textContent = 'Thank you — your email draft is ready. Please select Send in your email app to complete your request.';
  form.reset();
  aidFields.hidden = true;
  scheme.required = false;
  medicalNumber.required = false;
}

$('#booking-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const chosen = new Date(`${dateInput.value}T00:00:00`);
  if (chosen.getDay() === 0 || chosen.getDay() === 6) { dateInput.setCustomValidity('Please choose a weekday.'); dateInput.reportValidity(); return; }
  submitMail(form, 'Appointment request for Dr Ndou', $('.form-status', form));
});
$('#enquiry-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.checkValidity()) { form.reportValidity(); return; }
  submitMail(form, 'Enquiry for Dr Ndou', $('.form-status', form));
});
