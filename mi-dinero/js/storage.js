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
        THEME: 'midinero_theme'
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
        { id: 1, nombre: 'Efectivo', tipo: 'efectivo', saldoInicial: 0 },
        { id: 2, nombre: 'Banco', tipo: 'banco', saldoInicial: 0 }
    ],

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
            .filter(g => g.cuentaId === cuentaId)
            .reduce((sum, g) => sum + parseFloat(g.monto), 0);

        const transferencias = this.getTransferencias();
        const transferenciasEntrada = transferencias
            .filter(t => t.destinoId === cuentaId)
            .reduce((sum, t) => sum + parseFloat(t.monto), 0);
        const transferenciasSalida = transferencias
            .filter(t => t.origenId === cuentaId)
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

    // ==================== EXPORT / IMPORT ====================

    exportData() {
        const data = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            ingresos: this.getIngresos(),
            gastos: this.getGastos(),
            categorias: this.getCategorias(),
            metas: this.getMetas(),
            cuentas: this.getCuentas(),
            transferencias: this.getTransferencias(),
            presupuestos: this.getPresupuestos(),
            objetivos: this.getObjetivos()
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
