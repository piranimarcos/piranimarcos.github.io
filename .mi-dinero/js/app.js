/**
 * App Module - Lógica principal y navegación
 */

const App = {
    deleteCallback: null,

    init() {
        Storage.init();
        this.loadTheme();
        this.setupNavigation();
        this.setupForms();
        this.setupModal();
        this.setupExportImport();
        this.setupThemeToggle();
        this.setDefaultDates();
        this.refreshAll();
    },

    // ==================== THEME ====================

    loadTheme() {
        const theme = Storage.getTheme();
        document.body.dataset.theme = theme;
        this.updateThemeIcon();
    },

    setupThemeToggle() {
        document.getElementById('btn-theme').addEventListener('click', () => {
            const current = Storage.getTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            Storage.setTheme(next);
            document.body.dataset.theme = next;
            this.updateThemeIcon();
            this.refreshDashboard();
            this.refreshReportes();
        });
    },

    updateThemeIcon() {
        const btn = document.getElementById('btn-theme');
        btn.textContent = Storage.getTheme() === 'dark' ? '☀️' : '🌙';
    },

    // ==================== NAVEGACIÓN ====================

    setupNavigation() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                const targetId = tab.dataset.tab;
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                this.refreshSection(targetId);
            });
        });
    },

    refreshSection(section) {
        switch (section) {
            case 'dashboard': this.refreshDashboard(); break;
            case 'ingresos': this.refreshIngresos(); break;
            case 'gastos': this.refreshGastos(); break;
            case 'metas': this.refreshMetas(); break;
            case 'cuentas': this.refreshCuentas(); break;
            case 'reportes': this.refreshReportes(); break;
            case 'categorias': this.refreshCategorias(); break;
        }
    },

    refreshAll() {
        this.populateSelects();
        this.refreshDashboard();
        this.refreshIngresos();
        this.refreshGastos();
        this.refreshMetas();
        this.refreshCuentas();
        this.refreshReportes();
        this.refreshCategorias();
    },

    // ==================== FORMULARIOS ====================

    setupForms() {
        // Ingreso
        document.getElementById('form-ingreso').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIngresoSubmit();
        });
        document.getElementById('btn-cancelar-ingreso').addEventListener('click', () => this.resetIngresoForm());

        // Gasto
        document.getElementById('form-gasto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGastoSubmit();
        });
        document.getElementById('btn-cancelar-gasto').addEventListener('click', () => this.resetGastoForm());
        document.getElementById('gasto-recurrente').addEventListener('change', (e) => {
            document.getElementById('grupo-frecuencia').hidden = !e.target.checked;
        });

        // Meta
        document.getElementById('form-meta').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMetaSubmit();
        });
        document.getElementById('btn-cancelar-meta').addEventListener('click', () => this.resetMetaForm());

        // Objetivo de Reducción
        document.getElementById('form-objetivo').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleObjetivoSubmit();
        });

        // Cuenta
        document.getElementById('form-cuenta').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCuentaSubmit();
        });
        document.getElementById('btn-cancelar-cuenta').addEventListener('click', () => this.resetCuentaForm());

        // Transferencia
        document.getElementById('form-transferencia').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransferenciaSubmit();
        });

        // Categoría
        document.getElementById('form-categoria').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategoriaSubmit();
        });
        document.getElementById('btn-cancelar-categoria').addEventListener('click', () => this.resetCategoriaForm());

        // Presupuesto
        document.getElementById('form-presupuesto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePresupuestoSubmit();
        });

        // Filtros
        ['buscar-ingreso', 'ingreso-desde', 'ingreso-hasta'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.refreshIngresos());
        });

        ['buscar-gasto', 'filtro-categoria', 'filtro-cuenta', 'gasto-desde', 'gasto-hasta', 'gasto-min', 'gasto-max', 'filtro-tag'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => this.refreshGastos());
        });

        // Reportes
        document.getElementById('btn-comparar').addEventListener('click', () => this.compararMeses());
    },

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('ingreso-fecha').value = today;
        document.getElementById('gasto-fecha').value = today;
        document.getElementById('transfer-fecha').value = today;
    },

    // ==================== MODAL ====================

    setupModal() {
        document.getElementById('modal-confirm-btn').addEventListener('click', () => {
            if (this.deleteCallback) {
                this.deleteCallback();
                this.deleteCallback = null;
            }
            this.hideModal();
        });
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.hideModal());
    },

    showModal(message, callback) {
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-confirm').hidden = false;
        this.deleteCallback = callback;
    },

    hideModal() {
        document.getElementById('modal-confirm').hidden = true;
        this.deleteCallback = null;
    },

    // ==================== EXPORT / IMPORT ====================

    setupExportImport() {
        document.getElementById('btn-export').addEventListener('click', () => Storage.exportData());
        document.getElementById('btn-import').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    await Storage.importData(file);
                    this.refreshAll();
                    alert('Datos importados correctamente');
                } catch (error) {
                    alert('Error al importar: ' + error.message);
                }
                e.target.value = '';
            }
        });
    },

    // ==================== SELECTS ====================

    populateSelects() {
        const categorias = Storage.getCategorias();
        const cuentas = Storage.getCuentas();
        const meses = Storage.getMesesConDatos();

        // Categorías
        const catOptions = categorias.map(c => `<option value="${c.id}">${this.escapeHtml(c.nombre)}</option>`).join('');

        document.getElementById('gasto-categoria').innerHTML = '<option value="">Seleccionar...</option>' + catOptions;
        document.getElementById('filtro-categoria').innerHTML = '<option value="">Todas las categorías</option>' + catOptions;
        document.getElementById('presupuesto-categoria').innerHTML = '<option value="">Categoría...</option>' + catOptions;
        document.getElementById('objetivo-categoria').innerHTML = '<option value="">Categoría...</option>' + catOptions;

        // Cuentas
        const cuentaOptions = cuentas.map(c => `<option value="${c.id}">${this.escapeHtml(c.nombre)}</option>`).join('');

        document.getElementById('ingreso-cuenta').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('gasto-cuenta').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('filtro-cuenta').innerHTML = '<option value="">Todas las cuentas</option>' + cuentaOptions;
        document.getElementById('transfer-origen').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('transfer-destino').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;

        // Meses para reportes
        const mesOptions = meses.map(m => `<option value="${m}">${this.formatMes(m)}</option>`).join('');
        document.getElementById('reporte-mes-1').innerHTML = '<option value="">Mes 1...</option>' + mesOptions;
        document.getElementById('reporte-mes-2').innerHTML = '<option value="">Mes 2...</option>' + mesOptions;
    },

    // ==================== DASHBOARD ====================

    refreshDashboard() {
        const balance = Storage.getBalanceTotal();
        const ingresosMes = Storage.getTotalIngresosMes();
        const gastosMes = Storage.getTotalGastosMes();
        const metas = Storage.getMetas();
        const cuentas = Storage.getCuentas();

        // Balance
        const balanceEl = document.getElementById('balance-total');
        balanceEl.textContent = this.formatMoney(balance);
        balanceEl.classList.toggle('negative', balance < 0);

        // Balance por cuenta
        const balancePorCuenta = cuentas.map(c =>
            `${c.nombre}: ${this.formatMoney(Storage.getSaldoCuenta(c.id))}`
        ).join(' | ');
        document.getElementById('balance-por-cuenta').textContent = balancePorCuenta;

        // Ingresos y gastos del mes
        document.getElementById('ingresos-mes').textContent = this.formatMoney(ingresosMes);
        document.getElementById('gastos-mes').textContent = this.formatMoney(gastosMes);

        // Meta principal (prioridad más alta)
        const metaPrincipal = metas.sort((a, b) => a.prioridad - b.prioridad)[0];
        const progressBar = document.getElementById('meta-progress');
        const metaText = document.getElementById('meta-text');

        if (metaPrincipal) {
            const progreso = Math.min((balance / metaPrincipal.monto) * 100, 100);
            progressBar.style.width = `${Math.max(progreso, 0)}%`;
            metaText.textContent = `${metaPrincipal.descripcion}: ${this.formatMoney(balance)} / ${this.formatMoney(metaPrincipal.monto)}`;
        } else {
            progressBar.style.width = '0%';
            metaText.textContent = 'Sin meta definida';
        }

        // Alertas de recurrentes
        this.refreshAlertasRecurrentes();
        this.refreshAlertasPresupuesto();

        // Gráfico
        const gastosPorCategoria = Storage.getGastosPorCategoria();
        Charts.drawGastosPorCategoria('chart-gastos', gastosPorCategoria);
    },

    refreshAlertasRecurrentes() {
        const pendientes = Storage.getGastosRecurrentesPendientes();
        const container = document.getElementById('alertas-recurrentes');
        const lista = document.getElementById('lista-alertas');

        if (pendientes.length === 0) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        lista.innerHTML = pendientes.map(p => {
            const clase = p.diasRestantes <= 0 ? 'danger' : 'warning';
            const texto = p.diasRestantes <= 0
                ? `¡Vencido hace ${Math.abs(p.diasRestantes)} día(s)!`
                : `Vence en ${p.diasRestantes} día(s)`;
            return `
                <div class="alerta-item ${clase}">
                    <div>
                        <strong>${this.escapeHtml(p.descripcion)}</strong>
                        <div style="font-size:0.85rem">${texto} - ${this.formatMoney(p.monto)}</div>
                    </div>
                    <button class="btn btn-small btn-primary" onclick="App.registrarRecurrente(${p.id})">Registrar</button>
                </div>
            `;
        }).join('');
    },

    refreshAlertasPresupuesto() {
        const presupuestos = Storage.getPresupuestos();
        const categorias = Storage.getCategorias();
        const alertas = [];

        presupuestos.forEach(p => {
            const gastado = Storage.getGastosMesCategoria(p.categoriaId);
            const porcentaje = (gastado / p.monto) * 100;
            const categoria = categorias.find(c => c.id === p.categoriaId);

            if (porcentaje >= 80) {
                alertas.push({
                    categoria: categoria ? categoria.nombre : 'Sin categoría',
                    gastado,
                    limite: p.monto,
                    porcentaje,
                    excedido: porcentaje >= 100
                });
            }
        });

        const container = document.getElementById('alertas-presupuesto');
        const lista = document.getElementById('lista-alertas-presupuesto');

        if (alertas.length === 0) {
            container.hidden = true;
            return;
        }

        container.hidden = false;
        lista.innerHTML = alertas.map(a => {
            const clase = a.excedido ? 'danger' : 'warning';
            const texto = a.excedido ? '¡Excedido!' : 'Cerca del límite';
            return `
                <div class="alerta-item ${clase}">
                    <div>
                        <strong>${this.escapeHtml(a.categoria)}</strong>
                        <div style="font-size:0.85rem">${texto} - ${this.formatMoney(a.gastado)} / ${this.formatMoney(a.limite)} (${Math.round(a.porcentaje)}%)</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    registrarRecurrente(gastoId) {
        const gasto = Storage.getGastos().find(g => g.id === gastoId);
        if (!gasto) return;

        const hoy = new Date().toISOString().split('T')[0];
        Storage.addGasto({
            fecha: hoy,
            monto: gasto.monto,
            categoriaId: gasto.categoriaId,
            cuentaId: gasto.cuentaId,
            descripcion: gasto.descripcion,
            tags: gasto.tags,
            recurrente: true,
            frecuencia: gasto.frecuencia
        });

        this.refreshAll();
    },

    // ==================== INGRESOS ====================

    handleIngresoSubmit() {
        const id = document.getElementById('ingreso-id').value;
        const data = {
            fecha: document.getElementById('ingreso-fecha').value,
            monto: parseFloat(document.getElementById('ingreso-monto').value),
            cuentaId: parseInt(document.getElementById('ingreso-cuenta').value),
            descripcion: document.getElementById('ingreso-descripcion').value || 'Ingreso'
        };

        if (id) {
            Storage.updateIngreso(parseInt(id), data);
        } else {
            Storage.addIngreso(data);
        }

        this.resetIngresoForm();
        this.refreshIngresos();
        this.refreshDashboard();
        this.refreshCuentas();
    },

    resetIngresoForm() {
        document.getElementById('form-ingreso').reset();
        document.getElementById('ingreso-id').value = '';
        document.getElementById('ingreso-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('btn-cancelar-ingreso').hidden = true;
    },

    editIngreso(id) {
        const ingreso = Storage.getIngresos().find(i => i.id === id);
        if (ingreso) {
            document.getElementById('ingreso-id').value = ingreso.id;
            document.getElementById('ingreso-fecha').value = ingreso.fecha;
            document.getElementById('ingreso-monto').value = ingreso.monto;
            document.getElementById('ingreso-cuenta').value = ingreso.cuentaId || '';
            document.getElementById('ingreso-descripcion').value = ingreso.descripcion;
            document.getElementById('btn-cancelar-ingreso').hidden = false;
        }
    },

    deleteIngreso(id) {
        this.showModal('¿Eliminar este ingreso?', () => {
            Storage.deleteIngreso(id);
            this.refreshIngresos();
            this.refreshDashboard();
            this.refreshCuentas();
        });
    },

    refreshIngresos() {
        let ingresos = Storage.getIngresos();
        const cuentas = Storage.getCuentas();
        const buscar = document.getElementById('buscar-ingreso').value.toLowerCase();
        const desde = document.getElementById('ingreso-desde').value;
        const hasta = document.getElementById('ingreso-hasta').value;

        // Filtros
        if (buscar) {
            ingresos = ingresos.filter(i => i.descripcion.toLowerCase().includes(buscar));
        }
        if (desde) {
            ingresos = ingresos.filter(i => i.fecha >= desde);
        }
        if (hasta) {
            ingresos = ingresos.filter(i => i.fecha <= hasta);
        }

        ingresos = ingresos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const lista = document.getElementById('lista-ingresos');
        const total = ingresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
        document.getElementById('total-ingresos-filtrado').textContent = this.formatMoney(total);

        if (ingresos.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay ingresos registrados</p>';
            return;
        }

        lista.innerHTML = ingresos.map(ingreso => {
            const cuenta = cuentas.find(c => c.id === ingreso.cuentaId);
            return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="description">${this.escapeHtml(ingreso.descripcion)}</div>
                        <div class="details">${this.formatDate(ingreso.fecha)}${cuenta ? ' • ' + cuenta.nombre : ''}</div>
                    </div>
                    <div class="list-item-amount positive">${this.formatMoney(ingreso.monto)}</div>
                    <div class="list-item-actions">
                        <button class="btn btn-secondary btn-small" onclick="App.editIngreso(${ingreso.id})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="App.deleteIngreso(${ingreso.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== GASTOS ====================

    handleGastoSubmit() {
        const id = document.getElementById('gasto-id').value;
        const tagsStr = document.getElementById('gasto-tags').value;
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];

        const data = {
            fecha: document.getElementById('gasto-fecha').value,
            monto: parseFloat(document.getElementById('gasto-monto').value),
            categoriaId: parseInt(document.getElementById('gasto-categoria').value),
            cuentaId: parseInt(document.getElementById('gasto-cuenta').value),
            descripcion: document.getElementById('gasto-descripcion').value || 'Gasto',
            tags,
            recurrente: document.getElementById('gasto-recurrente').checked,
            frecuencia: document.getElementById('gasto-frecuencia').value
        };

        if (id) {
            Storage.updateGasto(parseInt(id), data);
        } else {
            Storage.addGasto(data);
        }

        this.resetGastoForm();
        this.refreshGastos();
        this.refreshDashboard();
        this.refreshCuentas();
    },

    resetGastoForm() {
        document.getElementById('form-gasto').reset();
        document.getElementById('gasto-id').value = '';
        document.getElementById('gasto-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('grupo-frecuencia').hidden = true;
        document.getElementById('btn-cancelar-gasto').hidden = true;
    },

    editGasto(id) {
        const gasto = Storage.getGastos().find(g => g.id === id);
        if (gasto) {
            document.getElementById('gasto-id').value = gasto.id;
            document.getElementById('gasto-fecha').value = gasto.fecha;
            document.getElementById('gasto-monto').value = gasto.monto;
            document.getElementById('gasto-categoria').value = gasto.categoriaId;
            document.getElementById('gasto-cuenta').value = gasto.cuentaId || '';
            document.getElementById('gasto-descripcion').value = gasto.descripcion;
            document.getElementById('gasto-tags').value = (gasto.tags || []).join(', ');
            document.getElementById('gasto-recurrente').checked = gasto.recurrente || false;
            document.getElementById('gasto-frecuencia').value = gasto.frecuencia || 'mensual';
            document.getElementById('grupo-frecuencia').hidden = !gasto.recurrente;
            document.getElementById('btn-cancelar-gasto').hidden = false;
        }
    },

    deleteGasto(id) {
        this.showModal('¿Eliminar este gasto?', () => {
            Storage.deleteGasto(id);
            this.refreshGastos();
            this.refreshDashboard();
            this.refreshCuentas();
        });
    },

    refreshGastos() {
        let gastos = Storage.getGastos();
        const categorias = Storage.getCategorias();
        const cuentas = Storage.getCuentas();

        // Filtros
        const buscar = document.getElementById('buscar-gasto').value.toLowerCase();
        const filtroCategoria = document.getElementById('filtro-categoria').value;
        const filtroCuenta = document.getElementById('filtro-cuenta').value;
        const desde = document.getElementById('gasto-desde').value;
        const hasta = document.getElementById('gasto-hasta').value;
        const montoMin = document.getElementById('gasto-min').value;
        const montoMax = document.getElementById('gasto-max').value;
        const filtroTag = document.getElementById('filtro-tag').value.toLowerCase();

        if (buscar) {
            gastos = gastos.filter(g => g.descripcion.toLowerCase().includes(buscar));
        }
        if (filtroCategoria) {
            gastos = gastos.filter(g => g.categoriaId === parseInt(filtroCategoria));
        }
        if (filtroCuenta) {
            gastos = gastos.filter(g => g.cuentaId === parseInt(filtroCuenta));
        }
        if (desde) {
            gastos = gastos.filter(g => g.fecha >= desde);
        }
        if (hasta) {
            gastos = gastos.filter(g => g.fecha <= hasta);
        }
        if (montoMin) {
            gastos = gastos.filter(g => parseFloat(g.monto) >= parseFloat(montoMin));
        }
        if (montoMax) {
            gastos = gastos.filter(g => parseFloat(g.monto) <= parseFloat(montoMax));
        }
        if (filtroTag) {
            gastos = gastos.filter(g => g.tags && g.tags.some(t => t.includes(filtroTag)));
        }

        gastos = gastos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        const lista = document.getElementById('lista-gastos');
        const total = gastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
        document.getElementById('total-gastos-filtrado').textContent = this.formatMoney(total);

        if (gastos.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay gastos registrados</p>';
            return;
        }

        lista.innerHTML = gastos.map(gasto => {
            const categoria = categorias.find(c => c.id === gasto.categoriaId);
            const cuenta = cuentas.find(c => c.id === gasto.cuentaId);
            const tagsHtml = (gasto.tags || []).map(t => `<span class="tag">${this.escapeHtml(t)}</span>`).join('');
            const recurrenteTag = gasto.recurrente ? `<span class="tag recurrente">🔄 ${gasto.frecuencia}</span>` : '';

            return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="description">${this.escapeHtml(gasto.descripcion)}</div>
                        <div class="details">${this.formatDate(gasto.fecha)} • ${categoria ? categoria.nombre : 'Sin categoría'}${cuenta ? ' • ' + cuenta.nombre : ''}</div>
                        <div class="tags">${tagsHtml}${recurrenteTag}</div>
                    </div>
                    <div class="list-item-amount negative">${this.formatMoney(gasto.monto)}</div>
                    <div class="list-item-actions">
                        <button class="btn btn-secondary btn-small" onclick="App.editGasto(${gasto.id})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="App.deleteGasto(${gasto.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== METAS ====================

    handleMetaSubmit() {
        const id = document.getElementById('meta-id').value;
        const data = {
            monto: parseFloat(document.getElementById('meta-monto').value),
            fecha: document.getElementById('meta-fecha').value,
            descripcion: document.getElementById('meta-descripcion').value,
            prioridad: parseInt(document.getElementById('meta-prioridad').value)
        };

        if (id) {
            Storage.updateMeta(parseInt(id), data);
        } else {
            Storage.addMeta(data);
        }

        this.resetMetaForm();
        this.refreshMetas();
        this.refreshDashboard();
    },

    resetMetaForm() {
        document.getElementById('form-meta').reset();
        document.getElementById('meta-id').value = '';
        document.getElementById('btn-submit-meta').textContent = 'Agregar Meta';
        document.getElementById('btn-cancelar-meta').hidden = true;
    },

    editMeta(id) {
        const meta = Storage.getMetas().find(m => m.id === id);
        if (meta) {
            document.getElementById('meta-id').value = meta.id;
            document.getElementById('meta-monto').value = meta.monto;
            document.getElementById('meta-fecha').value = meta.fecha;
            document.getElementById('meta-descripcion').value = meta.descripcion;
            document.getElementById('meta-prioridad').value = meta.prioridad || 2;
            document.getElementById('btn-submit-meta').textContent = 'Editar Meta';
            document.getElementById('btn-cancelar-meta').hidden = false;
        }
    },

    deleteMeta(id) {
        this.showModal('¿Eliminar esta meta?', () => {
            Storage.deleteMeta(id);
            this.refreshMetas();
            this.refreshDashboard();
        });
    },

    refreshMetas() {
        const metas = Storage.getMetas().sort((a, b) => a.prioridad - b.prioridad);
        const balance = Storage.getBalanceTotal();
        const lista = document.getElementById('lista-metas');

        if (metas.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay metas definidas</p>';
        } else {
            lista.innerHTML = metas.map(meta => {
                const progreso = Math.min((balance / meta.monto) * 100, 100);
                const prioridadLabel = ['Alta', 'Media', 'Baja'][meta.prioridad - 1] || 'Media';
                return `
                    <div class="meta-item">
                        <div class="meta-header">
                            <span class="meta-descripcion">${this.escapeHtml(meta.descripcion)}</span>
                            <span class="meta-monto">${this.formatMoney(meta.monto)}</span>
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar" style="width: ${Math.max(progreso, 0)}%"></div>
                        </div>
                        <div class="meta-ahorro">Progreso: ${this.formatMoney(balance)} (${Math.round(progreso)}%)</div>
                        <div class="meta-fecha">Límite: ${this.formatDate(meta.fecha)} • Prioridad: ${prioridadLabel}</div>
                        <div class="list-item-actions" style="margin-top: 10px">
                            <button class="btn btn-secondary btn-small" onclick="App.editMeta(${meta.id})">✏️</button>
                            <button class="btn btn-danger btn-small" onclick="App.deleteMeta(${meta.id})">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Objetivos de reducción
        this.refreshObjetivos();
    },

    handleObjetivoSubmit() {
        const categoriaId = parseInt(document.getElementById('objetivo-categoria').value);
        const porcentaje = parseInt(document.getElementById('objetivo-porcentaje').value);

        Storage.addObjetivo({ categoriaId, porcentaje, mesInicio: Storage.getMesActual() });

        document.getElementById('form-objetivo').reset();
        this.refreshObjetivos();
    },

    deleteObjetivo(categoriaId) {
        Storage.deleteObjetivo(categoriaId);
        this.refreshObjetivos();
    },

    refreshObjetivos() {
        const objetivos = Storage.getObjetivos();
        const categorias = Storage.getCategorias();
        const lista = document.getElementById('lista-objetivos');

        if (objetivos.length === 0) {
            lista.innerHTML = '<p class="empty-message">Sin objetivos de reducción</p>';
            return;
        }

        lista.innerHTML = objetivos.map(obj => {
            const categoria = categorias.find(c => c.id === obj.categoriaId);
            const gastoActual = Storage.getGastosMesCategoria(obj.categoriaId);
            // Estimar gasto del mes anterior (simplificado)
            const meses = Storage.getMesesConDatos();
            const mesAnterior = meses[1];
            const gastoAnterior = mesAnterior
                ? Storage.getGastos()
                    .filter(g => g.categoriaId === obj.categoriaId && g.fecha.startsWith(mesAnterior))
                    .reduce((sum, g) => sum + parseFloat(g.monto), 0)
                : 0;

            const objetivo = gastoAnterior * (1 - obj.porcentaje / 100);
            const cumplido = gastoActual <= objetivo;

            return `
                <div class="objetivo-item">
                    <div class="objetivo-header">
                        <span>${categoria ? categoria.nombre : 'Sin categoría'}: -${obj.porcentaje}%</span>
                        <button class="btn btn-danger btn-small" onclick="App.deleteObjetivo(${obj.categoriaId})">🗑️</button>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar ${!cumplido ? 'warning' : ''}" style="width: ${Math.min((gastoActual / objetivo) * 100, 100)}%"></div>
                    </div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary)">
                        Gastado: ${this.formatMoney(gastoActual)} / Objetivo: ${this.formatMoney(objetivo)}
                        ${cumplido ? '<span class="positive"> ✓ En camino</span>' : '<span class="negative"> ✗ Excedido</span>'}
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== CUENTAS ====================

    handleCuentaSubmit() {
        const id = document.getElementById('cuenta-id').value;
        const data = {
            nombre: document.getElementById('cuenta-nombre').value,
            tipo: document.getElementById('cuenta-tipo').value,
            saldoInicial: parseFloat(document.getElementById('cuenta-saldo-inicial').value) || 0
        };

        if (id) {
            Storage.updateCuenta(parseInt(id), data);
        } else {
            Storage.addCuenta(data);
        }

        this.resetCuentaForm();
        this.populateSelects();
        this.refreshCuentas();
        this.refreshDashboard();
    },

    resetCuentaForm() {
        document.getElementById('form-cuenta').reset();
        document.getElementById('cuenta-id').value = '';
        document.getElementById('btn-submit-cuenta').textContent = 'Agregar';
        document.getElementById('btn-cancelar-cuenta').hidden = true;
    },

    editCuenta(id) {
        const cuenta = Storage.getCuentas().find(c => c.id === id);
        if (cuenta) {
            document.getElementById('cuenta-id').value = cuenta.id;
            document.getElementById('cuenta-nombre').value = cuenta.nombre;
            document.getElementById('cuenta-tipo').value = cuenta.tipo;
            document.getElementById('cuenta-saldo-inicial').value = cuenta.saldoInicial;
            document.getElementById('btn-submit-cuenta').textContent = 'Editar';
            document.getElementById('btn-cancelar-cuenta').hidden = false;
        }
    },

    deleteCuenta(id) {
        this.showModal('¿Eliminar esta cuenta? Los ingresos y gastos asociados quedarán sin cuenta.', () => {
            Storage.deleteCuenta(id);
            this.populateSelects();
            this.refreshCuentas();
            this.refreshDashboard();
        });
    },

    handleTransferenciaSubmit() {
        const origenId = parseInt(document.getElementById('transfer-origen').value);
        const destinoId = parseInt(document.getElementById('transfer-destino').value);
        const monto = parseFloat(document.getElementById('transfer-monto').value);
        const fecha = document.getElementById('transfer-fecha').value;

        if (origenId === destinoId) {
            alert('Las cuentas de origen y destino deben ser diferentes');
            return;
        }

        Storage.addTransferencia({ origenId, destinoId, monto, fecha });

        document.getElementById('form-transferencia').reset();
        document.getElementById('transfer-fecha').value = new Date().toISOString().split('T')[0];
        this.refreshCuentas();
        this.refreshDashboard();
    },

    refreshCuentas() {
        const cuentas = Storage.getCuentas();
        const lista = document.getElementById('lista-cuentas');

        const iconos = { efectivo: '💵', banco: '🏦', billetera: '📱' };

        if (cuentas.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay cuentas</p>';
            return;
        }

        lista.innerHTML = cuentas.map(cuenta => {
            const saldo = Storage.getSaldoCuenta(cuenta.id);
            return `
                <div class="cuenta-item">
                    <div class="cuenta-info">
                        <span class="cuenta-icon">${iconos[cuenta.tipo] || '💰'}</span>
                        <span class="cuenta-nombre">${this.escapeHtml(cuenta.nombre)}</span>
                    </div>
                    <span class="cuenta-saldo ${saldo >= 0 ? 'positive' : 'negative'}">${this.formatMoney(saldo)}</span>
                    <div class="list-item-actions">
                        <button class="btn btn-secondary btn-small" onclick="App.editCuenta(${cuenta.id})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="App.deleteCuenta(${cuenta.id})">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ==================== REPORTES ====================

    refreshReportes() {
        this.populateSelects();
        Charts.drawEvolucionBalance('chart-evolucion', Storage.getBalanceHistorico());
        this.refreshCrecimientoCategorias();
        this.refreshResumenTags();
    },

    compararMeses() {
        const mes1 = document.getElementById('reporte-mes-1').value;
        const mes2 = document.getElementById('reporte-mes-2').value;
        const container = document.getElementById('comparativo-resultado');

        if (!mes1 || !mes2) {
            container.innerHTML = '<p class="empty-message">Selecciona dos meses para comparar</p>';
            return;
        }

        const datos1 = {
            ingresos: Storage.getTotalIngresosMes(mes1),
            gastos: Storage.getTotalGastosMes(mes1)
        };
        const datos2 = {
            ingresos: Storage.getTotalIngresosMes(mes2),
            gastos: Storage.getTotalGastosMes(mes2)
        };

        const diffIngresos = datos2.ingresos - datos1.ingresos;
        const diffGastos = datos2.gastos - datos1.gastos;

        container.innerHTML = `
            <div class="comparativo-grid">
                <div class="comparativo-mes">
                    <h4>${this.formatMes(mes1)}</h4>
                    <p>Ingresos: ${this.formatMoney(datos1.ingresos)}</p>
                    <p>Gastos: ${this.formatMoney(datos1.gastos)}</p>
                    <p>Balance: <span class="${datos1.ingresos - datos1.gastos >= 0 ? 'positive' : 'negative'}">${this.formatMoney(datos1.ingresos - datos1.gastos)}</span></p>
                </div>
                <div class="comparativo-mes">
                    <h4>${this.formatMes(mes2)}</h4>
                    <p>Ingresos: ${this.formatMoney(datos2.ingresos)}</p>
                    <p>Gastos: ${this.formatMoney(datos2.gastos)}</p>
                    <p>Balance: <span class="${datos2.ingresos - datos2.gastos >= 0 ? 'positive' : 'negative'}">${this.formatMoney(datos2.ingresos - datos2.gastos)}</span></p>
                </div>
            </div>
            <div class="comparativo-diferencia">
                <p>Diferencia en ingresos: <span class="${diffIngresos >= 0 ? 'positive' : 'negative'}">${diffIngresos >= 0 ? '+' : ''}${this.formatMoney(diffIngresos)}</span></p>
                <p>Diferencia en gastos: <span class="${diffGastos <= 0 ? 'positive' : 'negative'}">${diffGastos >= 0 ? '+' : ''}${this.formatMoney(diffGastos)}</span></p>
            </div>
        `;
    },

    refreshCrecimientoCategorias() {
        const meses = Storage.getMesesConDatos();
        const container = document.getElementById('categorias-crecimiento');

        if (meses.length < 2) {
            container.innerHTML = '<p class="empty-message">Se necesitan al menos 2 meses de datos</p>';
            return;
        }

        const mesActual = meses[0];
        const mesAnterior = meses[1];
        const gastosActual = Storage.getGastosPorCategoria(mesActual);
        const gastosAnterior = Storage.getGastosPorCategoria(mesAnterior);

        const crecimientos = [];
        for (const cat in gastosActual) {
            const actual = gastosActual[cat] || 0;
            const anterior = gastosAnterior[cat] || 0;
            if (anterior > 0) {
                const porcentaje = ((actual - anterior) / anterior) * 100;
                crecimientos.push({ categoria: cat, porcentaje, actual, anterior });
            } else if (actual > 0) {
                crecimientos.push({ categoria: cat, porcentaje: 100, actual, anterior: 0 });
            }
        }

        crecimientos.sort((a, b) => b.porcentaje - a.porcentaje);

        if (crecimientos.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay datos suficientes</p>';
            return;
        }

        container.innerHTML = crecimientos.slice(0, 5).map(c => `
            <div class="crecimiento-item">
                <span>${this.escapeHtml(c.categoria)}</span>
                <span class="crecimiento-porcentaje ${c.porcentaje > 0 ? 'up' : 'down'}">
                    ${c.porcentaje > 0 ? '↑' : '↓'} ${Math.abs(c.porcentaje).toFixed(1)}%
                </span>
            </div>
        `).join('');
    },

    refreshResumenTags() {
        const gastosPorTag = Storage.getGastosPorTag();
        const container = document.getElementById('resumen-tags');
        const entries = Object.entries(gastosPorTag).sort((a, b) => b[1] - a[1]);

        if (entries.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay gastos con etiquetas</p>';
            return;
        }

        container.innerHTML = entries.slice(0, 10).map(([tag, monto]) => `
            <div class="tag-resumen-item">
                <span class="tag">${this.escapeHtml(tag)}</span>
                <span>${this.formatMoney(monto)}</span>
            </div>
        `).join('');
    },

    // ==================== CATEGORÍAS ====================

    handleCategoriaSubmit() {
        const id = document.getElementById('categoria-id').value;
        const nombre = document.getElementById('categoria-nombre').value.trim();

        if (!nombre) return;

        if (id) {
            Storage.updateCategoria(parseInt(id), nombre);
        } else {
            Storage.addCategoria(nombre);
        }

        this.resetCategoriaForm();
        this.populateSelects();
        this.refreshCategorias();
    },

    resetCategoriaForm() {
        document.getElementById('form-categoria').reset();
        document.getElementById('categoria-id').value = '';
        document.getElementById('btn-submit-categoria').textContent = 'Agregar';
        document.getElementById('btn-cancelar-categoria').hidden = true;
    },

    editCategoria(id) {
        const categoria = Storage.getCategorias().find(c => c.id === id);
        if (categoria) {
            document.getElementById('categoria-id').value = categoria.id;
            document.getElementById('categoria-nombre').value = categoria.nombre;
            document.getElementById('btn-submit-categoria').textContent = 'Editar';
            document.getElementById('btn-cancelar-categoria').hidden = false;
        }
    },

    deleteCategoria(id) {
        const gastos = Storage.getGastos().filter(g => g.categoriaId === id);
        let mensaje = '¿Eliminar esta categoría?';
        if (gastos.length > 0) {
            mensaje += ` Hay ${gastos.length} gasto(s) asociados.`;
        }

        this.showModal(mensaje, () => {
            Storage.deleteCategoria(id);
            this.populateSelects();
            this.refreshCategorias();
        });
    },

    refreshCategorias() {
        const categorias = Storage.getCategorias();
        const lista = document.getElementById('lista-categorias');

        if (categorias.length === 0) {
            lista.innerHTML = '<p class="empty-message">No hay categorías</p>';
        } else {
            lista.innerHTML = categorias.map(cat => `
                <div class="category-item">
                    <span>${this.escapeHtml(cat.nombre)}</span>
                    <div class="list-item-actions">
                        <button class="btn btn-secondary btn-small" onclick="App.editCategoria(${cat.id})">✏️</button>
                        <button class="btn btn-danger btn-small" onclick="App.deleteCategoria(${cat.id})">🗑️</button>
                    </div>
                </div>
            `).join('');
        }

        // Presupuestos
        this.refreshPresupuestos();
    },

    handlePresupuestoSubmit() {
        const categoriaId = parseInt(document.getElementById('presupuesto-categoria').value);
        const monto = parseFloat(document.getElementById('presupuesto-monto').value);

        Storage.addPresupuesto({ categoriaId, monto });

        document.getElementById('form-presupuesto').reset();
        this.refreshPresupuestos();
        this.refreshDashboard();
    },

    deletePresupuesto(categoriaId) {
        Storage.deletePresupuesto(categoriaId);
        this.refreshPresupuestos();
        this.refreshDashboard();
    },

    refreshPresupuestos() {
        const presupuestos = Storage.getPresupuestos();
        const categorias = Storage.getCategorias();
        const lista = document.getElementById('lista-presupuestos');

        if (presupuestos.length === 0) {
            lista.innerHTML = '<p class="empty-message">Sin presupuestos definidos</p>';
            return;
        }

        lista.innerHTML = presupuestos.map(p => {
            const categoria = categorias.find(c => c.id === p.categoriaId);
            const gastado = Storage.getGastosMesCategoria(p.categoriaId);
            const porcentaje = Math.min((gastado / p.monto) * 100, 100);
            const excedido = porcentaje >= 100;

            return `
                <div class="presupuesto-item">
                    <div class="presupuesto-header">
                        <span class="presupuesto-categoria">${categoria ? categoria.nombre : 'Sin categoría'}</span>
                        <button class="btn btn-danger btn-small" onclick="App.deletePresupuesto(${p.categoriaId})">🗑️</button>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar ${excedido ? 'warning' : ''}" style="width: ${porcentaje}%"></div>
                    </div>
                    <span class="presupuesto-monto">${this.formatMoney(gastado)} / ${this.formatMoney(p.monto)}</span>
                </div>
            `;
        }).join('');
    },

    // ==================== UTILIDADES ====================

    formatMoney(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatMes(mesStr) {
        const [year, month] = mesStr.split('-');
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${meses[parseInt(month) - 1]} ${year}`;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
