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
        this.tryAutoUpdateCotizacion();
    },

    // Intenta actualizar cotización automáticamente si es necesario
    async tryAutoUpdateCotizacion() {
        const cotizacion = Storage.getCotizacion();
        const ahora = new Date();

        // Si nunca se cargó de API o pasó más de 1 hora, intentar actualizar
        let necesitaActualizar = !cotizacion.fechaAPI;

        if (cotizacion.fechaAPI) {
            const ultimaActualizacion = new Date(cotizacion.fechaAPI);
            const horasDesdeUltimaActualizacion = (ahora - ultimaActualizacion) / (1000 * 60 * 60);
            necesitaActualizar = horasDesdeUltimaActualizacion > 1;
        }

        if (necesitaActualizar) {
            const valor = await Storage.fetchCotizacionAPI();
            if (valor) {
                this.refreshCotizacionDisplay();
                this.refreshDashboard();
            }
        }
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
            case 'destinos': this.refreshDestinos(); break;
            case 'deudas': this.refreshDeudas(); break;
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
        this.refreshDestinos();
        this.refreshDeudas();
        this.refreshMetas();
        this.refreshCuentas();
        this.refreshReportes();
        this.refreshCategorias();
        this.refreshCotizacionDisplay();
    },

    // ==================== FORMULARIOS ====================

    setupForms() {
        // Ingreso
        document.getElementById('form-ingreso').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleIngresoSubmit();
        });
        document.getElementById('btn-cancelar-ingreso').addEventListener('click', () => this.resetIngresoForm());
        document.getElementById('ingreso-cuenta').addEventListener('change', (e) => {
            this.updateMontoLabel('ingreso', e.target.value);
        });

        // Gasto
        document.getElementById('form-gasto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGastoSubmit();
        });
        document.getElementById('btn-cancelar-gasto').addEventListener('click', () => this.resetGastoForm());
        document.getElementById('gasto-recurrente').addEventListener('change', (e) => {
            document.getElementById('grupo-frecuencia').hidden = !e.target.checked;
        });
        document.getElementById('gasto-cuenta').addEventListener('change', (e) => {
            this.updateMontoLabel('gasto', e.target.value);
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

        // Destino
        document.getElementById('form-destino').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDestinoSubmit();
        });
        document.getElementById('btn-cancelar-destino').addEventListener('click', () => this.resetDestinoForm());

        // Cotización
        document.getElementById('btn-refresh-cotizacion').addEventListener('click', () => this.refreshCotizacionAPI());
        document.getElementById('btn-cotizacion-manual').addEventListener('click', () => this.setCotizacionManual());

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

        // Deuda
        document.getElementById('form-deuda').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleDeudaSubmit();
        });
        document.getElementById('btn-cancelar-deuda').addEventListener('click', () => this.resetDeudaForm());

        // Pago de Deuda
        document.getElementById('form-pago-deuda').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePagoDeudaSubmit();
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
        document.getElementById('deuda-fecha').value = today;
        document.getElementById('pago-deuda-fecha').value = today;
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
        const destinos = Storage.getDestinos();

        // Categorías
        const catOptions = categorias.map(c => `<option value="${c.id}">${this.escapeHtml(c.nombre)}</option>`).join('');

        document.getElementById('gasto-categoria').innerHTML = '<option value="">Seleccionar...</option>' + catOptions;
        document.getElementById('filtro-categoria').innerHTML = '<option value="">Todas las categorías</option>' + catOptions;
        document.getElementById('presupuesto-categoria').innerHTML = '<option value="">Categoría...</option>' + catOptions;
        document.getElementById('objetivo-categoria').innerHTML = '<option value="">Categoría...</option>' + catOptions;

        // Cuentas
        const cuentaOptions = cuentas.map(c => {
            const monedaLabel = c.moneda === 'USD' ? ' (USD)' : '';
            return `<option value="${c.id}">${this.escapeHtml(c.nombre)}${monedaLabel}</option>`;
        }).join('');

        document.getElementById('ingreso-cuenta').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('gasto-cuenta').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('filtro-cuenta').innerHTML = '<option value="">Todas las cuentas</option>' + cuentaOptions;
        document.getElementById('transfer-origen').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;
        document.getElementById('transfer-destino').innerHTML = '<option value="">Seleccionar...</option>' + cuentaOptions;

        // Destinos
        const destinoOptions = destinos.map(d => `<option value="${d.id}">${d.icono} ${this.escapeHtml(d.nombre)}</option>`).join('');
        document.getElementById('ingreso-destino').innerHTML = '<option value="">Sin destino</option>' + destinoOptions;

        // Meses para reportes
        const mesOptions = meses.map(m => `<option value="${m}">${this.formatMes(m)}</option>`).join('');
        document.getElementById('reporte-mes-1').innerHTML = '<option value="">Mes 1...</option>' + mesOptions;
        document.getElementById('reporte-mes-2').innerHTML = '<option value="">Mes 2...</option>' + mesOptions;

        // Deudas para pagos
        const deudas = Storage.getDeudas();
        const deudasOptions = deudas.map(d => {
            const saldo = Storage.getSaldoDeuda(d.id);
            const monedaLabel = d.moneda === 'USD' ? 'US$' : '$';
            return `<option value="${d.id}">${this.escapeHtml(d.nombre)} (${monedaLabel}${saldo.toLocaleString()})</option>`;
        }).join('');
        document.getElementById('pago-deuda-select').innerHTML = '<option value="">Seleccionar deuda...</option>' + deudasOptions;

        // Cuenta para pago de deuda
        document.getElementById('pago-deuda-cuenta').innerHTML = '<option value="">Sin registrar en cuenta</option>' + cuentaOptions;
    },

    // ==================== DASHBOARD ====================

    refreshDashboard() {
        const balanceData = Storage.getBalanceDisponibleEnARS();
        const ingresosMes = Storage.getTotalIngresosMes();
        const gastosMes = Storage.getTotalGastosMes();
        const metas = Storage.getMetas();
        const cuentas = Storage.getCuentas();

        // Balance disponible en ARS (excluyendo destinos marcados)
        const balanceEl = document.getElementById('balance-disponible');
        balanceEl.textContent = this.formatMoney(balanceData.disponible);
        balanceEl.classList.toggle('negative', balanceData.disponible < 0);

        // Detalle de balance
        const detalleEl = document.getElementById('balance-detalle');
        if (balanceData.enDestinosExcluidos > 0) {
            detalleEl.innerHTML = `Total: ${this.formatMoney(balanceData.totalEnARS)} | En ahorro: ${this.formatMoney(balanceData.enDestinosExcluidos)}`;
        } else {
            detalleEl.textContent = '';
        }

        // Balance por cuenta con indicador de moneda
        const balancePorCuenta = cuentas.map(c => {
            const saldoData = Storage.getSaldoCuentaConMoneda(c.id);
            const formato = saldoData.moneda === 'USD'
                ? this.formatMoneyUSD(saldoData.saldo)
                : this.formatMoney(saldoData.saldo);
            return `${c.nombre}: ${formato}`;
        }).join(' | ');

        // Agregar resumen USD si hay cuentas en dólares
        let resumenExtra = '';
        if (balanceData.totalUSD > 0) {
            resumenExtra = ` | Total USD: ${this.formatMoneyUSD(balanceData.totalUSD)}`;
        }
        document.getElementById('balance-por-cuenta').textContent = balancePorCuenta + resumenExtra;

        // Ingresos y gastos del mes
        document.getElementById('ingresos-mes').textContent = this.formatMoney(ingresosMes);
        document.getElementById('gastos-mes').textContent = this.formatMoney(gastosMes);

        // Meta principal (prioridad más alta)
        const metaPrincipal = metas.sort((a, b) => a.prioridad - b.prioridad)[0];
        const progressBar = document.getElementById('meta-progress');
        const metaText = document.getElementById('meta-text');

        if (metaPrincipal) {
            const progreso = Math.min((balanceData.totalEnARS / metaPrincipal.monto) * 100, 100);
            progressBar.style.width = `${Math.max(progreso, 0)}%`;
            metaText.textContent = `${metaPrincipal.descripcion}: ${this.formatMoney(balanceData.totalEnARS)} / ${this.formatMoney(metaPrincipal.monto)}`;
        } else {
            progressBar.style.width = '0%';
            metaText.textContent = 'Sin meta definida';
        }

        // Alertas de recurrentes
        this.refreshAlertasRecurrentes();
        this.refreshAlertasPresupuesto();

        // Destinos en dashboard
        this.refreshDashboardDestinos();

        // Deudas en dashboard
        this.refreshDashboardDeudas();

        // Gráfico
        const gastosPorCategoria = Storage.getGastosPorCategoria();
        Charts.drawGastosPorCategoria('chart-gastos', gastosPorCategoria);
    },

    refreshDashboardDeudas() {
        const deudas = Storage.getDeudas();
        const container = document.getElementById('dashboard-deudas');

        if (deudas.length === 0) {
            container.innerHTML = '<p class="empty-message">Sin deudas</p>';
            return;
        }

        const totalDeudas = Storage.getTotalDeudasEnARS();
        let html = '';

        deudas.forEach(deuda => {
            const saldo = Storage.getSaldoDeuda(deuda.id);
            const totalPagado = Storage.getTotalPagadoDeuda(deuda.id);
            const progreso = deuda.montoTotal > 0 ? (totalPagado / deuda.montoTotal) * 100 : 0;
            const monedaLabel = deuda.moneda === 'USD' ? this.formatMoneyUSD(saldo) : this.formatMoney(saldo);
            const iconos = { tarjeta: '💳', prestamo: '🏦', personal: '👤', otro: '📋' };

            if (saldo > 0) {
                html += `
                    <div class="deuda-resumen-item">
                        <span class="deuda-icono">${iconos[deuda.tipo] || '📋'}</span>
                        <span class="deuda-nombre">${this.escapeHtml(deuda.nombre)}</span>
                        <div class="progress-container mini">
                            <div class="progress-bar" style="width: ${progreso}%"></div>
                        </div>
                        <span class="deuda-saldo negative">${monedaLabel}</span>
                    </div>
                `;
            }
        });

        if (html === '') {
            container.innerHTML = '<p class="empty-message positive">Sin deudas pendientes</p>';
        } else {
            html += `<div class="deuda-total">Total: ${this.formatMoney(totalDeudas.totalEnARS)}</div>`;
            container.innerHTML = html;
        }
    },

    refreshDashboardDestinos() {
        const destinos = Storage.getDestinos();
        const container = document.getElementById('dashboard-destinos');

        if (destinos.length === 0) {
            container.innerHTML = '<p class="empty-message">Sin destinos</p>';
            return;
        }

        container.innerHTML = destinos.map(destino => {
            const total = Storage.getTotalPorDestino(destino.id);
            const formatFn = destino.moneda === 'USD' ? this.formatMoneyUSD.bind(this) : this.formatMoney.bind(this);
            const excluirTag = destino.excluirDelBalance ? '<span class="tag-mini excluido">Reservado</span>' : '';
            let progressHtml = '';

            if (destino.montoObjetivo > 0) {
                const progreso = Math.min((total / destino.montoObjetivo) * 100, 100);
                progressHtml = `
                    <div class="progress-container mini">
                        <div class="progress-bar" style="width: ${progreso}%"></div>
                    </div>
                    <span class="destino-meta">${formatFn(total)} / ${formatFn(destino.montoObjetivo)}</span>
                `;
            } else {
                progressHtml = `<span class="destino-total">${formatFn(total)}</span>`;
            }

            return `
                <div class="destino-resumen-item">
                    <span class="destino-icono">${destino.icono}</span>
                    <span class="destino-nombre">${this.escapeHtml(destino.nombre)} ${excluirTag}</span>
                    ${progressHtml}
                </div>
            `;
        }).join('');
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
        const destinoValue = document.getElementById('ingreso-destino').value;
        const data = {
            fecha: document.getElementById('ingreso-fecha').value,
            monto: parseFloat(document.getElementById('ingreso-monto').value),
            cuentaId: parseInt(document.getElementById('ingreso-cuenta').value),
            descripcion: document.getElementById('ingreso-descripcion').value || 'Ingreso',
            destinoId: destinoValue ? parseInt(destinoValue) : null
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
            document.getElementById('ingreso-destino').value = ingreso.destinoId || '';
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

        const destinos = Storage.getDestinos();

        lista.innerHTML = ingresos.map(ingreso => {
            const cuenta = cuentas.find(c => c.id === ingreso.cuentaId);
            const destino = ingreso.destinoId ? destinos.find(d => d.id === ingreso.destinoId) : null;
            const destinoTag = destino ? `<span class="tag destino-tag">${destino.icono} ${destino.nombre}</span>` : '';

            return `
                <div class="list-item">
                    <div class="list-item-info">
                        <div class="description">${this.escapeHtml(ingreso.descripcion)}</div>
                        <div class="details">${this.formatDate(ingreso.fecha)}${cuenta ? ' • ' + cuenta.nombre : ''}</div>
                        ${destinoTag ? `<div class="tags">${destinoTag}</div>` : ''}
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

    // ==================== DESTINOS ====================

    handleDestinoSubmit() {
        const id = document.getElementById('destino-id').value;
        const descripcionEl = document.getElementById('destino-descripcion');
        const iconoSelect = document.getElementById('destino-icono');
        const data = {
            nombre: document.getElementById('destino-nombre').value,
            icono: iconoSelect.value,
            montoObjetivo: parseFloat(document.getElementById('destino-objetivo').value) || 0,
            moneda: document.getElementById('destino-moneda').value,
            excluirDelBalance: document.getElementById('destino-excluir').checked,
            descripcion: descripcionEl ? descripcionEl.value : ''
        };

        if (id) {
            Storage.updateDestino(parseInt(id), data);
        } else {
            Storage.addDestino(data);
        }

        this.resetDestinoForm();
        this.populateSelects();
        this.refreshDestinos();
        this.refreshDashboard();
    },

    resetDestinoForm() {
        document.getElementById('form-destino').reset();
        document.getElementById('destino-id').value = '';
        document.getElementById('destino-icono').selectedIndex = 0;
        document.getElementById('destino-moneda').value = 'ARS';
        document.getElementById('destino-excluir').checked = false;
        document.getElementById('btn-submit-destino').textContent = 'Agregar Destino';
        document.getElementById('btn-cancelar-destino').hidden = true;
    },

    editDestino(id) {
        const destino = Storage.getDestinos().find(d => d.id === id);
        if (destino) {
            document.getElementById('destino-id').value = destino.id;
            document.getElementById('destino-nombre').value = destino.nombre;

            // Seleccionar el icono en el select, o usar el primero si no existe
            const iconoSelect = document.getElementById('destino-icono');
            const iconoOption = Array.from(iconoSelect.options).find(opt => opt.value === destino.icono);
            if (iconoOption) {
                iconoSelect.value = destino.icono;
            } else {
                iconoSelect.value = iconoSelect.options[0].value;
            }

            document.getElementById('destino-objetivo').value = destino.montoObjetivo || '';
            document.getElementById('destino-moneda').value = destino.moneda || 'ARS';
            document.getElementById('destino-excluir').checked = destino.excluirDelBalance || false;
            const descripcionEl = document.getElementById('destino-descripcion');
            if (descripcionEl) descripcionEl.value = destino.descripcion || '';
            document.getElementById('btn-submit-destino').textContent = 'Guardar Cambios';
            document.getElementById('btn-cancelar-destino').hidden = false;

            // Scroll al formulario
            document.getElementById('form-destino').scrollIntoView({ behavior: 'smooth' });
        }
    },

    deleteDestino(id) {
        const ingresos = Storage.getIngresos().filter(i => i.destinoId === id);
        let mensaje = '¿Eliminar este destino?';
        if (ingresos.length > 0) {
            mensaje += ` Hay ${ingresos.length} ingreso(s) asociados (no se eliminarán, pero perderán su destino asignado).`;
        }

        this.showModal(mensaje, () => {
            Storage.deleteDestino(id);
            this.populateSelects();
            this.refreshDestinos();
            this.refreshDashboard();
        });
    },

    refreshDestinos() {
        const destinos = Storage.getDestinos();
        const lista = document.getElementById('lista-destinos');

        if (destinos.length === 0) {
            lista.innerHTML = '<p class="empty-message">Sin destinos de ahorro. Crea tu primer destino arriba.</p>';
        } else {
            lista.innerHTML = destinos.map(destino => {
                const total = Storage.getTotalPorDestino(destino.id);
                const ingresosCount = Storage.getIngresos().filter(i => i.destinoId === destino.id).length;
                const formatFn = destino.moneda === 'USD' ? this.formatMoneyUSD.bind(this) : this.formatMoney.bind(this);
                const monedaBadge = destino.moneda === 'USD' ? '<span class="moneda-badge usd">USD</span>' : '';
                const excluirBadge = destino.excluirDelBalance ? '<span class="tag-mini excluido">Reservado</span>' : '';
                let progressHtml = '';

                if (destino.montoObjetivo > 0) {
                    const progreso = Math.min((total / destino.montoObjetivo) * 100, 100);
                    const completado = progreso >= 100;
                    progressHtml = `
                        <div class="progress-container">
                            <div class="progress-bar ${completado ? 'completed' : ''}" style="width: ${progreso}%"></div>
                        </div>
                        <div class="destino-progreso">
                            ${formatFn(total)} / ${formatFn(destino.montoObjetivo)}
                            <span class="${completado ? 'positive' : ''}">(${Math.round(progreso)}%)</span>
                            ${completado ? ' ✓' : ''}
                        </div>
                    `;
                } else {
                    progressHtml = `<div class="destino-progreso">Acumulado: <strong>${formatFn(total)}</strong></div>`;
                }

                const descripcionHtml = destino.descripcion
                    ? `<div class="destino-descripcion">${this.escapeHtml(destino.descripcion)}</div>`
                    : '';

                return `
                    <div class="destino-item">
                        <div class="destino-header">
                            <div class="destino-titulo-container">
                                <span class="destino-titulo">${destino.icono} ${this.escapeHtml(destino.nombre)} ${monedaBadge} ${excluirBadge}</span>
                                <span class="destino-ingresos-count">${ingresosCount} ingreso(s)</span>
                            </div>
                            <div class="list-item-actions">
                                <button class="btn btn-secondary btn-small" onclick="App.editDestino(${destino.id})" title="Editar">✏️</button>
                                <button class="btn btn-danger btn-small" onclick="App.deleteDestino(${destino.id})" title="Eliminar">🗑️</button>
                            </div>
                        </div>
                        ${descripcionHtml}
                        ${progressHtml}
                    </div>
                `;
            }).join('');
        }

        // Actualizar resumen de destinos
        this.refreshResumenDestinos();
    },

    refreshResumenDestinos() {
        const destinos = Storage.getDestinos();
        const container = document.getElementById('resumen-destinos');

        if (!container) return;

        if (destinos.length === 0) {
            container.innerHTML = '<p class="empty-message">Sin destinos configurados</p>';
            return;
        }

        let totalGeneralARS = 0;
        const resumenItems = destinos.map(destino => {
            const total = Storage.getTotalPorDestino(destino.id);
            const totalEnARS = Storage.getTotalPorDestinoEnARS(destino.id);
            totalGeneralARS += totalEnARS;
            return { destino, total, totalEnARS };
        });

        // Recalcular porcentajes con el total correcto
        const html = resumenItems.map(({ destino, total, totalEnARS }) => {
            const porcentaje = totalGeneralARS > 0 ? (totalEnARS / totalGeneralARS * 100) : 0;
            const formatFn = destino.moneda === 'USD' ? this.formatMoneyUSD.bind(this) : this.formatMoney.bind(this);
            const conversionHtml = destino.moneda === 'USD' && total > 0
                ? `<span class="conversion">(${this.formatMoney(totalEnARS)})</span>`
                : '';
            const excluirTag = destino.excluirDelBalance ? '<span class="tag-mini excluido">Reservado</span>' : '';

            return `
                <div class="resumen-destino-item">
                    <div class="resumen-destino-info">
                        <span class="resumen-destino-icono">${destino.icono}</span>
                        <span class="resumen-destino-nombre">${this.escapeHtml(destino.nombre)} ${excluirTag}</span>
                    </div>
                    <div class="resumen-destino-datos">
                        <span class="resumen-destino-monto">${formatFn(total)} ${conversionHtml}</span>
                        <span class="resumen-destino-porcentaje">(${porcentaje.toFixed(1)}%)</span>
                    </div>
                </div>
            `;
        }).join('');

        const totalExcluido = Storage.getTotalEnDestinosExcluidos();
        const excluirInfo = totalExcluido > 0
            ? `<div class="resumen-destino-excluido">Reservado (excluido del balance disponible): ${this.formatMoney(totalExcluido)}</div>`
            : '';

        container.innerHTML = `
            ${html}
            <div class="resumen-destino-total">
                <strong>Total en Destinos:</strong> ${this.formatMoney(totalGeneralARS)}
            </div>
            ${excluirInfo}
        `;
    },

    // ==================== DEUDAS ====================

    handleDeudaSubmit() {
        const id = document.getElementById('deuda-id').value;
        const data = {
            nombre: document.getElementById('deuda-nombre').value,
            tipo: document.getElementById('deuda-tipo').value,
            montoTotal: parseFloat(document.getElementById('deuda-monto').value),
            moneda: document.getElementById('deuda-moneda').value,
            fechaCreacion: document.getElementById('deuda-fecha').value,
            fechaVencimiento: document.getElementById('deuda-vencimiento').value || null,
            descripcion: document.getElementById('deuda-descripcion').value || ''
        };

        if (id) {
            Storage.updateDeuda(parseInt(id), data);
        } else {
            Storage.addDeuda(data);
        }

        this.resetDeudaForm();
        this.populateSelects();
        this.refreshDeudas();
        this.refreshDashboard();
    },

    resetDeudaForm() {
        document.getElementById('form-deuda').reset();
        document.getElementById('deuda-id').value = '';
        document.getElementById('deuda-fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('btn-submit-deuda').textContent = 'Agregar Deuda';
        document.getElementById('btn-cancelar-deuda').hidden = true;
    },

    editDeuda(id) {
        const deuda = Storage.getDeudas().find(d => d.id === id);
        if (deuda) {
            document.getElementById('deuda-id').value = deuda.id;
            document.getElementById('deuda-nombre').value = deuda.nombre;
            document.getElementById('deuda-tipo').value = deuda.tipo;
            document.getElementById('deuda-monto').value = deuda.montoTotal;
            document.getElementById('deuda-moneda').value = deuda.moneda || 'ARS';
            document.getElementById('deuda-fecha').value = deuda.fechaCreacion || '';
            document.getElementById('deuda-vencimiento').value = deuda.fechaVencimiento || '';
            document.getElementById('deuda-descripcion').value = deuda.descripcion || '';
            document.getElementById('btn-submit-deuda').textContent = 'Guardar Cambios';
            document.getElementById('btn-cancelar-deuda').hidden = false;

            document.getElementById('form-deuda').scrollIntoView({ behavior: 'smooth' });
        }
    },

    deleteDeuda(id) {
        const pagos = Storage.getPagosPorDeuda(id);
        let mensaje = '¿Eliminar esta deuda?';
        if (pagos.length > 0) {
            mensaje += ` Se eliminarán también ${pagos.length} pago(s) asociados.`;
        }

        this.showModal(mensaje, () => {
            Storage.deleteDeuda(id);
            this.populateSelects();
            this.refreshDeudas();
            this.refreshDashboard();
        });
    },

    handlePagoDeudaSubmit() {
        const deudaId = parseInt(document.getElementById('pago-deuda-select').value);
        const cuentaValue = document.getElementById('pago-deuda-cuenta').value;

        const data = {
            deudaId,
            monto: parseFloat(document.getElementById('pago-deuda-monto').value),
            fecha: document.getElementById('pago-deuda-fecha').value,
            cuentaId: cuentaValue ? parseInt(cuentaValue) : null,
            descripcion: document.getElementById('pago-deuda-descripcion').value || ''
        };

        // Registrar gasto solo si seleccionó una cuenta
        const registrarGasto = !!cuentaValue;
        Storage.addPagoDeuda(data, registrarGasto);

        document.getElementById('form-pago-deuda').reset();
        document.getElementById('pago-deuda-fecha').value = new Date().toISOString().split('T')[0];
        this.populateSelects();
        this.refreshDeudas();
        this.refreshDashboard();
        this.refreshGastos();
        this.refreshCuentas();
    },

    deletePagoDeuda(id) {
        this.showModal('¿Eliminar este pago?', () => {
            Storage.deletePagoDeuda(id);
            this.populateSelects();
            this.refreshDeudas();
            this.refreshDashboard();
        });
    },

    refreshDeudas() {
        const deudas = Storage.getDeudas();
        const lista = document.getElementById('lista-deudas');
        const resumen = document.getElementById('resumen-deudas');
        const iconos = { tarjeta: '💳', prestamo: '🏦', personal: '👤', otro: '📋' };

        // Resumen total
        const totalDeudas = Storage.getTotalDeudasEnARS();
        if (totalDeudas.totalEnARS > 0) {
            let resumenHtml = `<div class="deuda-total-resumen">Total de Deudas: <span class="negative">${this.formatMoney(totalDeudas.totalEnARS)}</span>`;
            if (totalDeudas.totalUSD > 0) {
                resumenHtml += ` | USD: ${this.formatMoneyUSD(totalDeudas.totalUSD)}`;
            }
            resumenHtml += '</div>';
            resumen.innerHTML = resumenHtml;
        } else {
            resumen.innerHTML = '';
        }

        if (deudas.length === 0) {
            lista.innerHTML = '<p class="empty-message">Sin deudas registradas</p>';
            return;
        }

        lista.innerHTML = deudas.map(deuda => {
            const saldo = Storage.getSaldoDeuda(deuda.id);
            const totalPagado = Storage.getTotalPagadoDeuda(deuda.id);
            const progreso = deuda.montoTotal > 0 ? (totalPagado / deuda.montoTotal) * 100 : 0;
            const completado = saldo <= 0;
            const formatFn = deuda.moneda === 'USD' ? this.formatMoneyUSD.bind(this) : this.formatMoney.bind(this);
            const monedaBadge = deuda.moneda === 'USD' ? '<span class="moneda-badge usd">USD</span>' : '';

            const pagos = Storage.getPagosPorDeuda(deuda.id);
            let pagosHtml = '';
            if (pagos.length > 0) {
                pagosHtml = `
                    <div class="deuda-pagos">
                        <strong>Últimos pagos:</strong>
                        ${pagos.slice(-3).reverse().map(p => `
                            <div class="pago-item">
                                <span>${this.formatDate(p.fecha)}: ${formatFn(p.monto)}</span>
                                <button class="btn btn-danger btn-small" onclick="App.deletePagoDeuda(${p.id})">🗑️</button>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            const vencimientoHtml = deuda.fechaVencimiento
                ? `<span class="deuda-vencimiento">Vence: ${this.formatDate(deuda.fechaVencimiento)}</span>`
                : '';

            return `
                <div class="deuda-item ${completado ? 'completado' : ''}">
                    <div class="deuda-header">
                        <div class="deuda-titulo-container">
                            <span class="deuda-icono">${iconos[deuda.tipo] || '📋'}</span>
                            <span class="deuda-titulo">${this.escapeHtml(deuda.nombre)} ${monedaBadge}</span>
                            ${vencimientoHtml}
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-secondary btn-small" onclick="App.editDeuda(${deuda.id})" title="Editar">✏️</button>
                            <button class="btn btn-danger btn-small" onclick="App.deleteDeuda(${deuda.id})" title="Eliminar">🗑️</button>
                        </div>
                    </div>
                    ${deuda.descripcion ? `<div class="deuda-descripcion">${this.escapeHtml(deuda.descripcion)}</div>` : ''}
                    <div class="progress-container">
                        <div class="progress-bar ${completado ? 'completed' : ''}" style="width: ${progreso}%"></div>
                    </div>
                    <div class="deuda-progreso">
                        Pagado: ${formatFn(totalPagado)} / ${formatFn(deuda.montoTotal)}
                        <span class="${completado ? 'positive' : 'negative'}">(${Math.round(progreso)}%)</span>
                        ${completado ? ' ✓ Saldada' : ` - Resta: ${formatFn(saldo)}`}
                    </div>
                    ${pagosHtml}
                </div>
            `;
        }).join('');
    },

    // ==================== COTIZACIÓN ====================

    refreshCotizacionDisplay() {
        const cotizacion = Storage.getCotizacion();
        const valorActual = Storage.getCotizacionActual();

        document.getElementById('cotizacion-actual').textContent = this.formatMoney(valorActual);

        if (cotizacion.fechaAPI && !cotizacion.usarManual) {
            const fecha = new Date(cotizacion.fechaAPI);
            document.getElementById('cotizacion-fecha').textContent =
                `Actualizado: ${fecha.toLocaleDateString('es-AR')} ${fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            document.getElementById('cotizacion-fecha').textContent = 'Valor manual';
        }
    },

    async refreshCotizacionAPI() {
        const btn = document.getElementById('btn-refresh-cotizacion');
        btn.disabled = true;
        btn.textContent = '⏳';

        const valor = await Storage.fetchCotizacionAPI();

        if (valor) {
            this.refreshCotizacionDisplay();
            this.refreshDashboard();
        } else {
            alert('No se pudo obtener la cotización. Usa el valor manual.');
        }

        btn.disabled = false;
        btn.textContent = '🔄';
    },

    setCotizacionManual() {
        const input = document.getElementById('cotizacion-manual-input');
        const valor = parseFloat(input.value);

        if (!valor || valor <= 0) {
            alert('Ingresa un valor válido');
            return;
        }

        Storage.setValorManual(valor);
        input.value = '';
        this.refreshCotizacionDisplay();
        this.refreshDashboard();
    },

    // ==================== CUENTAS ====================

    handleCuentaSubmit() {
        const id = document.getElementById('cuenta-id').value;
        const data = {
            nombre: document.getElementById('cuenta-nombre').value,
            tipo: document.getElementById('cuenta-tipo').value,
            moneda: document.getElementById('cuenta-moneda').value,
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
            document.getElementById('cuenta-moneda').value = cuenta.moneda || 'ARS';
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
            const saldoData = Storage.getSaldoCuentaConMoneda(cuenta.id);
            const saldoFormateado = saldoData.moneda === 'USD'
                ? this.formatMoneyUSD(saldoData.saldo)
                : this.formatMoney(saldoData.saldo);
            const monedaBadge = cuenta.moneda === 'USD' ? '<span class="moneda-badge usd">USD</span>' : '';

            return `
                <div class="cuenta-item">
                    <div class="cuenta-info">
                        <span class="cuenta-icon">${iconos[cuenta.tipo] || '💰'}</span>
                        <span class="cuenta-nombre">${this.escapeHtml(cuenta.nombre)} ${monedaBadge}</span>
                    </div>
                    <span class="cuenta-saldo ${saldoData.saldo >= 0 ? 'positive' : 'negative'}">${saldoFormateado}</span>
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

    formatMoneyUSD(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
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
    },

    updateMontoLabel(tipo, cuentaId) {
        const label = document.getElementById(`${tipo}-monto-label`);
        if (!label) return;

        if (!cuentaId) {
            label.textContent = 'Monto';
            return;
        }

        const cuenta = Storage.getCuentas().find(c => c.id === parseInt(cuentaId));
        if (cuenta && cuenta.moneda === 'USD') {
            label.textContent = 'Monto (USD)';
        } else {
            label.textContent = 'Monto (ARS)';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
