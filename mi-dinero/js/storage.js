/**
 * Storage Module - Manejo de persistencia con localStorage y export/import JSON
 */

const Storage = {
    KEYS: {
        INGRESOS: 'midinero_ingresos',
        GASTOS: 'midinero_gastos',
        CATEGORIAS: 'midinero_categorias',
        METAS: 'midinero_metas',
        CUENTAS: 'midinero_cuentas',
        TRANSFERENCIAS: 'midinero_transferencias',
        PRESUPUESTOS: 'midinero_presupuestos',
        OBJETIVOS: 'midinero_objetivos',
        THEME: 'midinero_theme',
        DESTINOS: 'midinero_destinos',
        COTIZACION: 'midinero_cotizacion',
        DEUDAS: 'midinero_deudas',
        PAGOS_DEUDA: 'midinero_pagos_deuda'
    },

    // Categorías por defecto
    DEFAULT_CATEGORIAS: [
        { id: 1, nombre: 'Comida' },
        { id: 2, nombre: 'Transporte' },
        { id: 3, nombre: 'Servicios' },
        { id: 4, nombre: 'Entretenimiento' },
        { id: 5, nombre: 'Salud' },
        { id: 6, nombre: 'Educación' },
        { id: 7, nombre: 'Ropa' },
        { id: 8, nombre: 'Hogar' },
        { id: 9, nombre: 'Suscripciones' },
        { id: 10, nombre: 'Otros' }
    ],

    // Cuentas por defecto
    DEFAULT_CUENTAS: [
        { id: 1, nombre: 'Efectivo', tipo: 'efectivo', moneda: 'ARS', saldoInicial: 0 },
        { id: 2, nombre: 'Banco', tipo: 'banco', moneda: 'ARS', saldoInicial: 0 }
    ],

    // Destinos por defecto
    DEFAULT_DESTINOS: [
        { id: 1, nombre: 'Colchón de Imprevistos', icono: '🛡️', montoObjetivo: 0, moneda: 'ARS', excluirDelBalance: true, descripcion: 'Para emergencias y gastos inesperados' },
        { id: 2, nombre: 'Ahorro Jubilación', icono: '👴', montoObjetivo: 0, moneda: 'ARS', excluirDelBalance: true, descripcion: 'Ahorro a largo plazo para el retiro' },
        { id: 3, nombre: 'Dinero Líquido', icono: '💵', montoObjetivo: 0, moneda: 'ARS', excluirDelBalance: false, descripcion: 'Efectivo disponible para uso inmediato' },
        { id: 4, nombre: 'Fondo Cambio Auto', icono: '🚗', montoObjetivo: 0, moneda: 'USD', excluirDelBalance: true, descripcion: 'Ahorro para cambiar el vehículo' }
    ],

    // Cotización por defecto
    DEFAULT_COTIZACION: {
        valorManual: 1450,
        valorAPI: 0,
        fechaAPI: null,
        usarManual: true
    },

    /**
     * Inicializa el storage con datos por defecto si está vacío
     */
    init() {
        if (!localStorage.getItem(this.KEYS.CATEGORIAS)) {
            this.setCategorias(this.DEFAULT_CATEGORIAS);
        }
        if (!localStorage.getItem(this.KEYS.CUENTAS)) {
            this.setCuentas(this.DEFAULT_CUENTAS);
        }
        if (!localStorage.getItem(this.KEYS.INGRESOS)) {
            this.setIngresos([]);
        }
        if (!localStorage.getItem(this.KEYS.GASTOS)) {
            this.setGastos([]);
        }
        if (!localStorage.getItem(this.KEYS.METAS)) {
            this.setMetas([]);
        }
        if (!localStorage.getItem(this.KEYS.TRANSFERENCIAS)) {
            this.setTransferencias([]);
        }
        if (!localStorage.getItem(this.KEYS.PRESUPUESTOS)) {
            this.setPresupuestos([]);
        }
        if (!localStorage.getItem(this.KEYS.OBJETIVOS)) {
            this.setObjetivos([]);
        }
        if (!localStorage.getItem(this.KEYS.DESTINOS)) {
            this.setDestinos(this.DEFAULT_DESTINOS);
        }
        if (!localStorage.getItem(this.KEYS.COTIZACION)) {
            this.setCotizacion(this.DEFAULT_COTIZACION);
        }
        if (!localStorage.getItem(this.KEYS.DEUDAS)) {
            this.setDeudas([]);
        }
        if (!localStorage.getItem(this.KEYS.PAGOS_DEUDA)) {
            this.setPagosDeuda([]);
        }
        // Migrar cuentas existentes para agregar moneda si no la tienen
        this.migrateCuentasMoneda();
        // Migrar destinos existentes para agregar moneda y excluirDelBalance
        this.migrateDestinosMoneda();
        // Migrar transferencias para campos bidireccionales
        this.migrateTransferencias();
        // Migrar gastos para fuente (cuenta o destino)
        this.migrateGastosFuente();
        // Migrar cuentas para agregar excluirDelBalance
        this.migrateCuentasExcluir();
    },

    migrateCuentasMoneda() {
        const cuentas = this.getCuentas();
        let needsUpdate = false;
        cuentas.forEach(cuenta => {
            if (!cuenta.moneda) {
                cuenta.moneda = 'ARS';
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            this.setCuentas(cuentas);
        }
    },

    migrateDestinosMoneda() {
        const destinos = this.getDestinos();
        let needsUpdate = false;
        destinos.forEach(destino => {
            if (!destino.moneda) {
                destino.moneda = 'ARS';
                needsUpdate = true;
            }
            if (destino.excluirDelBalance === undefined) {
                destino.excluirDelBalance = false;
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            this.setDestinos(destinos);
        }
    },

    migrateTransferencias() {
        const transferencias = this.getTransferencias();
        let needsUpdate = false;
        transferencias.forEach(t => {
            if (t.origenTipo === undefined) {
                t.origenTipo = 'cuenta';
                needsUpdate = true;
            }
            if (t.destinoTipo === undefined) {
                t.destinoTipo = 'cuenta';
                needsUpdate = true;
            }
            if (t.descripcion === undefined) {
                t.descripcion = '';
                needsUpdate = true;
            }
            if (t.tags === undefined) {
                t.tags = [];
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            this.setTransferencias(transferencias);
        }
    },

    migrateGastosFuente() {
        const gastos = this.getGastos();
        let needsUpdate = false;
        gastos.forEach(g => {
            if (g.fuenteTipo === undefined) {
                g.fuenteTipo = 'cuenta';
                needsUpdate = true;
            }
            if (g.fuenteId === undefined) {
                g.fuenteId = g.cuentaId;
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            this.setGastos(gastos);
        }
    },

    migrateCuentasExcluir() {
        const cuentas = this.getCuentas();
        let needsUpdate = false;
        cuentas.forEach(cuenta => {
            if (cuenta.excluirDelBalance === undefined) {
                cuenta.excluirDelBalance = false;
                needsUpdate = true;
            }
        });
        if (needsUpdate) {
            this.setCuentas(cuentas);
        }
    },

    // ==================== THEME ====================

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    setTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    // ==================== INGRESOS ====================

    getIngresos() {
        const data = localStorage.getItem(this.KEYS.INGRESOS);
        return data ? JSON.parse(data) : [];
    },

    setIngresos(ingresos) {
        localStorage.setItem(this.KEYS.INGRESOS, JSON.stringify(ingresos));
    },

    addIngreso(ingreso) {
        const ingresos = this.getIngresos();
        ingreso.id = Date.now();
        ingresos.push(ingreso);
        this.setIngresos(ingresos);
        return ingreso;
    },

    updateIngreso(id, data) {
        const ingresos = this.getIngresos();
        const index = ingresos.findIndex(i => i.id === id);
        if (index !== -1) {
            ingresos[index] = { ...ingresos[index], ...data };
            this.setIngresos(ingresos);
            return ingresos[index];
        }
        return null;
    },

    deleteIngreso(id) {
        const ingresos = this.getIngresos();
        const filtered = ingresos.filter(i => i.id !== id);
        this.setIngresos(filtered);
    },

    // ==================== GASTOS ====================

    getGastos() {
        const data = localStorage.getItem(this.KEYS.GASTOS);
        return data ? JSON.parse(data) : [];
    },

    setGastos(gastos) {
        localStorage.setItem(this.KEYS.GASTOS, JSON.stringify(gastos));
    },

    addGasto(gasto) {
        const gastos = this.getGastos();
        gasto.id = Date.now();
        gastos.push(gasto);
        this.setGastos(gastos);
        return gasto;
    },

    updateGasto(id, data) {
        const gastos = this.getGastos();
        const index = gastos.findIndex(g => g.id === id);
        if (index !== -1) {
            gastos[index] = { ...gastos[index], ...data };
            this.setGastos(gastos);
            return gastos[index];
        }
        return null;
    },

    deleteGasto(id) {
        const gastos = this.getGastos();
        const filtered = gastos.filter(g => g.id !== id);
        this.setGastos(filtered);
    },

    // ==================== CATEGORÍAS ====================

    getCategorias() {
        const data = localStorage.getItem(this.KEYS.CATEGORIAS);
        return data ? JSON.parse(data) : [];
    },

    setCategorias(categorias) {
        localStorage.setItem(this.KEYS.CATEGORIAS, JSON.stringify(categorias));
    },

    addCategoria(nombre) {
        const categorias = this.getCategorias();
        const categoria = {
            id: Date.now(),
            nombre: nombre
        };
        categorias.push(categoria);
        this.setCategorias(categorias);
        return categoria;
    },

    updateCategoria(id, nombre) {
        const categorias = this.getCategorias();
        const index = categorias.findIndex(c => c.id === id);
        if (index !== -1) {
            categorias[index].nombre = nombre;
            this.setCategorias(categorias);
            return categorias[index];
        }
        return null;
    },

    deleteCategoria(id) {
        const categorias = this.getCategorias();
        const filtered = categorias.filter(c => c.id !== id);
        this.setCategorias(filtered);
    },

    // ==================== METAS ====================

    getMetas() {
        const data = localStorage.getItem(this.KEYS.METAS);
        return data ? JSON.parse(data) : [];
    },

    setMetas(metas) {
        localStorage.setItem(this.KEYS.METAS, JSON.stringify(metas));
    },

    addMeta(meta) {
        const metas = this.getMetas();
        meta.id = Date.now();
        metas.push(meta);
        this.setMetas(metas);
        return meta;
    },

    updateMeta(id, data) {
        const metas = this.getMetas();
        const index = metas.findIndex(m => m.id === id);
        if (index !== -1) {
            metas[index] = { ...metas[index], ...data };
            this.setMetas(metas);
            return metas[index];
        }
        return null;
    },

    deleteMeta(id) {
        const metas = this.getMetas();
        const filtered = metas.filter(m => m.id !== id);
        this.setMetas(filtered);
    },

    // ==================== CUENTAS ====================

    getCuentas() {
        const data = localStorage.getItem(this.KEYS.CUENTAS);
        return data ? JSON.parse(data) : [];
    },

    setCuentas(cuentas) {
        localStorage.setItem(this.KEYS.CUENTAS, JSON.stringify(cuentas));
    },

    addCuenta(cuenta) {
        const cuentas = this.getCuentas();
        cuenta.id = Date.now();
        cuentas.push(cuenta);
        this.setCuentas(cuentas);
        return cuenta;
    },

    updateCuenta(id, data) {
        const cuentas = this.getCuentas();
        const index = cuentas.findIndex(c => c.id === id);
        if (index !== -1) {
            cuentas[index] = { ...cuentas[index], ...data };
            this.setCuentas(cuentas);
            return cuentas[index];
        }
        return null;
    },

    deleteCuenta(id) {
        const cuentas = this.getCuentas();
        const filtered = cuentas.filter(c => c.id !== id);
        this.setCuentas(filtered);
    },

    getSaldoCuenta(cuentaId) {
        const cuenta = this.getCuentas().find(c => c.id === cuentaId);
        if (!cuenta) return 0;

        const saldoInicial = parseFloat(cuenta.saldoInicial) || 0;

        const ingresos = this.getIngresos()
            .filter(i => i.cuentaId === cuentaId)
            .reduce((sum, i) => sum + parseFloat(i.monto), 0);

        const gastos = this.getGastos()
            .filter(g => (g.fuenteTipo || 'cuenta') === 'cuenta' && (g.fuenteId || g.cuentaId) === cuentaId)
            .reduce((sum, g) => sum + parseFloat(g.monto), 0);

        const transferencias = this.getTransferencias();
        const transferenciasEntrada = transferencias
            .filter(t => (t.destinoTipo || 'cuenta') === 'cuenta' && t.destinoId === cuentaId)
            .reduce((sum, t) => sum + parseFloat(t.montoDestino != null ? t.montoDestino : t.monto), 0);
        const transferenciasSalida = transferencias
            .filter(t => (t.origenTipo || 'cuenta') === 'cuenta' && t.origenId === cuentaId)
            .reduce((sum, t) => sum + parseFloat(t.monto), 0);

        return saldoInicial + ingresos - gastos + transferenciasEntrada - transferenciasSalida;
    },

    // ==================== TRANSFERENCIAS ====================

    getTransferencias() {
        const data = localStorage.getItem(this.KEYS.TRANSFERENCIAS);
        return data ? JSON.parse(data) : [];
    },

    setTransferencias(transferencias) {
        localStorage.setItem(this.KEYS.TRANSFERENCIAS, JSON.stringify(transferencias));
    },

    addTransferencia(transferencia) {
        const transferencias = this.getTransferencias();
        transferencia.id = Date.now();
        transferencias.push(transferencia);
        this.setTransferencias(transferencias);
        return transferencia;
    },

    updateTransferencia(id, data) {
        const transferencias = this.getTransferencias();
        const index = transferencias.findIndex(t => t.id === id);
        if (index !== -1) {
            transferencias[index] = { ...transferencias[index], ...data };
            this.setTransferencias(transferencias);
            return transferencias[index];
        }
        return null;
    },

    deleteTransferencia(id) {
        const transferencias = this.getTransferencias();
        const filtered = transferencias.filter(t => t.id !== id);
        this.setTransferencias(filtered);
    },

    // ==================== PRESUPUESTOS ====================

    getPresupuestos() {
        const data = localStorage.getItem(this.KEYS.PRESUPUESTOS);
        return data ? JSON.parse(data) : [];
    },

    setPresupuestos(presupuestos) {
        localStorage.setItem(this.KEYS.PRESUPUESTOS, JSON.stringify(presupuestos));
    },

    addPresupuesto(presupuesto) {
        const presupuestos = this.getPresupuestos();
        // Reemplazar si ya existe para esa categoría
        const index = presupuestos.findIndex(p => p.categoriaId === presupuesto.categoriaId);
        if (index !== -1) {
            presupuestos[index] = presupuesto;
        } else {
            presupuesto.id = Date.now();
            presupuestos.push(presupuesto);
        }
        this.setPresupuestos(presupuestos);
        return presupuesto;
    },

    deletePresupuesto(categoriaId) {
        const presupuestos = this.getPresupuestos();
        const filtered = presupuestos.filter(p => p.categoriaId !== categoriaId);
        this.setPresupuestos(filtered);
    },

    getGastosMesCategoria(categoriaId) {
        const gastos = this.getGastos();
        const now = new Date();
        const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        return gastos
            .filter(g => g.categoriaId === categoriaId && g.fecha.startsWith(mesActual))
            .reduce((sum, g) => sum + parseFloat(g.monto), 0);
    },

    // ==================== OBJETIVOS DE REDUCCIÓN ====================

    getObjetivos() {
        const data = localStorage.getItem(this.KEYS.OBJETIVOS);
        return data ? JSON.parse(data) : [];
    },

    setObjetivos(objetivos) {
        localStorage.setItem(this.KEYS.OBJETIVOS, JSON.stringify(objetivos));
    },

    addObjetivo(objetivo) {
        const objetivos = this.getObjetivos();
        // Reemplazar si ya existe para esa categoría
        const index = objetivos.findIndex(o => o.categoriaId === objetivo.categoriaId);
        if (index !== -1) {
            objetivos[index] = objetivo;
        } else {
            objetivo.id = Date.now();
            objetivos.push(objetivo);
        }
        this.setObjetivos(objetivos);
        return objetivo;
    },

    deleteObjetivo(categoriaId) {
        const objetivos = this.getObjetivos();
        const filtered = objetivos.filter(o => o.categoriaId !== categoriaId);
        this.setObjetivos(filtered);
    },

    // ==================== DESTINOS ====================

    getDestinos() {
        const data = localStorage.getItem(this.KEYS.DESTINOS);
        return data ? JSON.parse(data) : [];
    },

    setDestinos(destinos) {
        localStorage.setItem(this.KEYS.DESTINOS, JSON.stringify(destinos));
    },

    addDestino(destino) {
        const destinos = this.getDestinos();
        destino.id = Date.now();
        destinos.push(destino);
        this.setDestinos(destinos);
        return destino;
    },

    updateDestino(id, data) {
        const destinos = this.getDestinos();
        const index = destinos.findIndex(d => d.id === id);
        if (index !== -1) {
            destinos[index] = { ...destinos[index], ...data };
            this.setDestinos(destinos);
            return destinos[index];
        }
        return null;
    },

    deleteDestino(id) {
        const destinos = this.getDestinos();
        const filtered = destinos.filter(d => d.id !== id);
        this.setDestinos(filtered);
    },

    getTotalPorDestino(destinoId) {
        const ingresos = this.getIngresos()
            .filter(i => i.destinoId === destinoId)
            .reduce((sum, i) => sum + parseFloat(i.monto), 0);

        const transferencias = this.getTransferencias();
        const transferenciasEntrada = transferencias
            .filter(t => (t.destinoTipo || 'cuenta') === 'destino' && t.destinoId === destinoId)
            .reduce((sum, t) => sum + parseFloat(t.montoDestino != null ? t.montoDestino : t.monto), 0);
        const transferenciasSalida = transferencias
            .filter(t => (t.origenTipo || 'cuenta') === 'destino' && t.origenId === destinoId)
            .reduce((sum, t) => sum + parseFloat(t.monto), 0);

        const gastos = this.getGastos()
            .filter(g => (g.fuenteTipo) === 'destino' && g.fuenteId === destinoId)
            .reduce((sum, g) => sum + parseFloat(g.monto), 0);

        return ingresos + transferenciasEntrada - transferenciasSalida - gastos;
    },

    getTotalPorDestinoEnARS(destinoId) {
        const destino = this.getDestinos().find(d => d.id === destinoId);
        if (!destino) return 0;

        const total = this.getTotalPorDestino(destinoId);
        if (destino.moneda === 'USD') {
            return total * this.getCotizacionActual();
        }
        return total;
    },

    getTotalEnDestinosExcluidos() {
        const destinos = this.getDestinos().filter(d => d.excluirDelBalance);
        let totalARS = 0;

        destinos.forEach(destino => {
            totalARS += this.getTotalPorDestinoEnARS(destino.id);
        });

        return totalARS;
    },

    getBalanceDisponibleEnARS() {
        const cuentas = this.getCuentas();
        const destinos = this.getDestinos();
        const cotizacion = this.getCotizacionActual();

        let totalARS = 0;
        let totalUSD = 0;
        let disponibleARS = 0;
        let disponibleUSD = 0;

        cuentas.forEach(cuenta => {
            const saldo = this.getSaldoCuenta(cuenta.id);
            if (cuenta.moneda === 'USD') {
                totalUSD += saldo;
                if (!cuenta.excluirDelBalance) disponibleUSD += saldo;
            } else {
                totalARS += saldo;
                if (!cuenta.excluirDelBalance) disponibleARS += saldo;
            }
        });

        destinos.forEach(destino => {
            const saldo = this.getTotalPorDestino(destino.id);
            if (destino.moneda === 'USD') {
                totalUSD += saldo;
                if (!destino.excluirDelBalance) disponibleUSD += saldo;
            } else {
                totalARS += saldo;
                if (!destino.excluirDelBalance) disponibleARS += saldo;
            }
        });

        const totalEnARS = totalARS + (totalUSD * cotizacion);
        const disponible = disponibleARS + (disponibleUSD * cotizacion);
        const enAhorro = totalEnARS - disponible;

        return {
            totalARS,
            totalUSD,
            totalEnARS,
            cotizacion,
            disponible,
            enAhorro
        };
    },

    // ==================== COTIZACIÓN ====================

    getCotizacion() {
        const data = localStorage.getItem(this.KEYS.COTIZACION);
        return data ? JSON.parse(data) : this.DEFAULT_COTIZACION;
    },

    setCotizacion(cotizacion) {
        localStorage.setItem(this.KEYS.COTIZACION, JSON.stringify(cotizacion));
    },

    getCotizacionActual() {
        const cot = this.getCotizacion();
        if (cot.usarManual || !cot.valorAPI) {
            return cot.valorManual;
        }
        return cot.valorAPI;
    },

    async fetchCotizacionAPI() {
        try {
            const response = await fetch('https://dolarapi.com/v1/dolares/blue');
            if (!response.ok) throw new Error('Error en API');
            const data = await response.json();

            const cotizacion = this.getCotizacion();
            cotizacion.valorAPI = data.venta;
            cotizacion.fechaAPI = new Date().toISOString();
            cotizacion.usarManual = false;
            this.setCotizacion(cotizacion);

            return data.venta;
        } catch (error) {
            console.error('Error obteniendo cotización:', error);
            return null;
        }
    },

    setValorManual(valor) {
        const cotizacion = this.getCotizacion();
        cotizacion.valorManual = valor;
        cotizacion.usarManual = true;
        this.setCotizacion(cotizacion);
    },

    // ==================== DEUDAS ====================

    getDeudas() {
        const data = localStorage.getItem(this.KEYS.DEUDAS);
        return data ? JSON.parse(data) : [];
    },

    setDeudas(deudas) {
        localStorage.setItem(this.KEYS.DEUDAS, JSON.stringify(deudas));
    },

    addDeuda(deuda) {
        const deudas = this.getDeudas();
        deuda.id = Date.now();
        deuda.fechaCreacion = deuda.fechaCreacion || new Date().toISOString().split('T')[0];
        deudas.push(deuda);
        this.setDeudas(deudas);
        return deuda;
    },

    updateDeuda(id, data) {
        const deudas = this.getDeudas();
        const index = deudas.findIndex(d => d.id === id);
        if (index !== -1) {
            deudas[index] = { ...deudas[index], ...data };
            this.setDeudas(deudas);
            return deudas[index];
        }
        return null;
    },

    deleteDeuda(id) {
        const deudas = this.getDeudas();
        const filtered = deudas.filter(d => d.id !== id);
        this.setDeudas(filtered);
        // También eliminar pagos asociados
        const pagos = this.getPagosDeuda().filter(p => p.deudaId !== id);
        this.setPagosDeuda(pagos);
    },

    // ==================== PAGOS DE DEUDA ====================

    getPagosDeuda() {
        const data = localStorage.getItem(this.KEYS.PAGOS_DEUDA);
        return data ? JSON.parse(data) : [];
    },

    setPagosDeuda(pagos) {
        localStorage.setItem(this.KEYS.PAGOS_DEUDA, JSON.stringify(pagos));
    },

    addPagoDeuda(pago, registrarGasto = false) {
        const pagos = this.getPagosDeuda();
        pago.id = Date.now();
        pagos.push(pago);
        this.setPagosDeuda(pagos);

        // Opcionalmente registrar como gasto si hay cuenta asociada
        if (registrarGasto && pago.cuentaId) {
            const deuda = this.getDeudas().find(d => d.id === pago.deudaId);
            this.addGasto({
                fecha: pago.fecha,
                monto: pago.monto,
                categoriaId: 10, // Otros
                cuentaId: pago.cuentaId,
                fuenteTipo: 'cuenta',
                fuenteId: pago.cuentaId,
                descripcion: `Pago deuda: ${deuda ? deuda.nombre : 'Deuda'}`,
                tags: ['deuda', 'pago'],
                recurrente: false
            });
        }

        return pago;
    },

    deletePagoDeuda(id) {
        const pagos = this.getPagosDeuda();
        const filtered = pagos.filter(p => p.id !== id);
        this.setPagosDeuda(filtered);
    },

    getPagosPorDeuda(deudaId) {
        return this.getPagosDeuda().filter(p => p.deudaId === deudaId);
    },

    getSaldoDeuda(deudaId) {
        const deuda = this.getDeudas().find(d => d.id === deudaId);
        if (!deuda) return 0;

        const totalPagado = this.getPagosPorDeuda(deudaId)
            .reduce((sum, p) => sum + parseFloat(p.monto), 0);

        return parseFloat(deuda.montoTotal) - totalPagado;
    },

    getTotalPagadoDeuda(deudaId) {
        return this.getPagosPorDeuda(deudaId)
            .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    },

    getTotalDeudasEnARS() {
        const deudas = this.getDeudas();
        const cotizacion = this.getCotizacionActual();
        let totalARS = 0;
        let totalUSD = 0;

        deudas.forEach(deuda => {
            const saldo = this.getSaldoDeuda(deuda.id);
            if (deuda.moneda === 'USD') {
                totalUSD += saldo;
            } else {
                totalARS += saldo;
            }
        });

        return {
            totalARS,
            totalUSD,
            totalEnARS: totalARS + (totalUSD * cotizacion),
            cotizacion
        };
    },

    // ==================== SALDO CON MONEDA ====================

    getSaldoCuentaConMoneda(cuentaId) {
        const cuenta = this.getCuentas().find(c => c.id === cuentaId);
        if (!cuenta) return { saldo: 0, moneda: 'ARS' };

        const saldo = this.getSaldoCuenta(cuentaId);
        return { saldo, moneda: cuenta.moneda || 'ARS' };
    },

    getBalanceTotalEnARS() {
        const cuentas = this.getCuentas();
        const destinos = this.getDestinos();
        const cotizacion = this.getCotizacionActual();
        let totalARS = 0;
        let totalUSD = 0;

        cuentas.forEach(cuenta => {
            const saldo = this.getSaldoCuenta(cuenta.id);
            if (cuenta.moneda === 'USD') {
                totalUSD += saldo;
            } else {
                totalARS += saldo;
            }
        });

        destinos.forEach(destino => {
            const saldo = this.getTotalPorDestino(destino.id);
            if (destino.moneda === 'USD') {
                totalUSD += saldo;
            } else {
                totalARS += saldo;
            }
        });

        return {
            totalARS,
            totalUSD,
            totalEnARS: totalARS + (totalUSD * cotizacion),
            cotizacion
        };
    },

    // ==================== EXPORT / IMPORT ====================

    exportData() {
        const data = {
            version: '5.0',
            exportDate: new Date().toISOString(),
            ingresos: this.getIngresos(),
            gastos: this.getGastos(),
            categorias: this.getCategorias(),
            metas: this.getMetas(),
            cuentas: this.getCuentas(),
            transferencias: this.getTransferencias(),
            presupuestos: this.getPresupuestos(),
            objetivos: this.getObjetivos(),
            destinos: this.getDestinos(),
            cotizacion: this.getCotizacion(),
            deudas: this.getDeudas(),
            pagosDeuda: this.getPagosDeuda()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-dinero-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validar estructura básica
                    if (!data.ingresos || !data.gastos || !data.categorias) {
                        throw new Error('Formato de archivo inválido');
                    }

                    // Importar datos
                    this.setIngresos(data.ingresos);
                    this.setGastos(data.gastos);
                    this.setCategorias(data.categorias);

                    // Datos opcionales (compatibilidad con v1)
                    if (data.metas) this.setMetas(data.metas);
                    else if (data.meta) this.setMetas([data.meta]); // Migrar de v1

                    if (data.cuentas) this.setCuentas(data.cuentas);
                    if (data.transferencias) this.setTransferencias(data.transferencias);
                    if (data.presupuestos) this.setPresupuestos(data.presupuestos);
                    if (data.objetivos) this.setObjetivos(data.objetivos);
                    if (data.destinos) this.setDestinos(data.destinos);
                    if (data.cotizacion) this.setCotizacion(data.cotizacion);
                    if (data.deudas) this.setDeudas(data.deudas);
                    if (data.pagosDeuda) this.setPagosDeuda(data.pagosDeuda);

                    // Migrar cuentas para agregar moneda
                    this.migrateCuentasMoneda();
                    // Migrar destinos para agregar moneda y excluirDelBalance
                    this.migrateDestinosMoneda();
                    // Migrar transferencias para campos bidireccionales
                    this.migrateTransferencias();
                    // Migrar gastos para fuente
                    this.migrateGastosFuente();
                    // Migrar cuentas para excluirDelBalance
                    this.migrateCuentasExcluir();

                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    },

    // ==================== UTILIDADES ====================

    getTotalIngresosMes(mes = null) {
        const ingresos = this.getIngresos();
        const mesTarget = mes || this.getMesActual();

        return ingresos
            .filter(i => i.fecha.startsWith(mesTarget))
            .reduce((sum, i) => sum + parseFloat(i.monto), 0);
    },

    getTotalGastosMes(mes = null) {
        const gastos = this.getGastos();
        const mesTarget = mes || this.getMesActual();

        return gastos
            .filter(g => g.fecha.startsWith(mesTarget))
            .reduce((sum, g) => sum + parseFloat(g.monto), 0);
    },

    getMesActual() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    },

    getBalanceTotal() {
        const cuentas = this.getCuentas();
        return cuentas.reduce((sum, c) => sum + this.getSaldoCuenta(c.id), 0);
    },

    getGastosPorCategoria(mes = null) {
        const gastos = this.getGastos();
        const categorias = this.getCategorias();
        const mesTarget = mes || this.getMesActual();
        const result = {};

        categorias.forEach(cat => {
            result[cat.nombre] = 0;
        });

        gastos
            .filter(g => g.fecha.startsWith(mesTarget))
            .forEach(gasto => {
                const categoria = categorias.find(c => c.id === gasto.categoriaId);
                if (categoria) {
                    result[categoria.nombre] += parseFloat(gasto.monto);
                }
            });

        return Object.fromEntries(
            Object.entries(result).filter(([_, value]) => value > 0)
        );
    },

    getGastosRecurrentesPendientes() {
        const gastos = this.getGastos();
        const recurrentes = gastos.filter(g => g.recurrente);
        const pendientes = [];
        const hoy = new Date();

        recurrentes.forEach(gasto => {
            const ultimaFecha = new Date(gasto.fecha);
            let proximaFecha = new Date(ultimaFecha);

            switch (gasto.frecuencia) {
                case 'semanal':
                    proximaFecha.setDate(proximaFecha.getDate() + 7);
                    break;
                case 'mensual':
                    proximaFecha.setMonth(proximaFecha.getMonth() + 1);
                    break;
                case 'anual':
                    proximaFecha.setFullYear(proximaFecha.getFullYear() + 1);
                    break;
            }

            const diasHastaProximo = Math.ceil((proximaFecha - hoy) / (1000 * 60 * 60 * 24));

            if (diasHastaProximo <= 7 && diasHastaProximo >= -3) {
                pendientes.push({
                    ...gasto,
                    proximaFecha: proximaFecha.toISOString().split('T')[0],
                    diasRestantes: diasHastaProximo
                });
            }
        });

        return pendientes;
    },

    getMesesConDatos() {
        const ingresos = this.getIngresos();
        const gastos = this.getGastos();
        const meses = new Set();

        ingresos.forEach(i => meses.add(i.fecha.substring(0, 7)));
        gastos.forEach(g => meses.add(g.fecha.substring(0, 7)));

        return Array.from(meses).sort().reverse();
    },

    getGastosPorTag() {
        const gastos = this.getGastos();
        const result = {};

        gastos.forEach(gasto => {
            if (gasto.tags && gasto.tags.length > 0) {
                gasto.tags.forEach(tag => {
                    if (!result[tag]) result[tag] = 0;
                    result[tag] += parseFloat(gasto.monto);
                });
            }
        });

        return result;
    },

    getTransferenciasPorTag() {
        const transferencias = this.getTransferencias();
        const result = {};

        transferencias.forEach(t => {
            if (t.tags && t.tags.length > 0) {
                t.tags.forEach(tag => {
                    if (!result[tag]) result[tag] = 0;
                    result[tag] += parseFloat(t.monto);
                });
            }
        });

        return result;
    },

    getBalanceHistorico() {
        const meses = this.getMesesConDatos();
        const resultado = [];

        meses.slice(0, 12).reverse().forEach(mes => {
            const ingresos = this.getTotalIngresosMes(mes);
            const gastos = this.getTotalGastosMes(mes);
            resultado.push({
                mes,
                ingresos,
                gastos,
                balance: ingresos - gastos
            });
        });

        return resultado;
    }
};
