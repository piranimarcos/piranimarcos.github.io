/**
 * Charts Module - Gráficos simples con Canvas
 */

const Charts = {
    colors: [
        '#e94560', '#4ecca3', '#0f3460', '#ff6b6b', '#4ecdc4',
        '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8'
    ],

    getTextColor() {
        return document.body.dataset.theme === 'light' ? '#1a1a2e' : '#eaeaea';
    },

    getSecondaryColor() {
        return document.body.dataset.theme === 'light' ? '#666666' : '#a0a0a0';
    },

    /**
     * Dibuja un gráfico de barras horizontales para gastos por categoría
     */
    drawGastosPorCategoria(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const entries = Object.entries(data);

        // Limpiar canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = Math.max(250, entries.length * 40 + 50);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (entries.length === 0) {
            ctx.fillStyle = this.getSecondaryColor();
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos para mostrar', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Configuración
        const padding = { top: 20, right: 100, bottom: 20, left: 120 };
        const barHeight = 25;
        const barGap = 15;
        const maxValue = Math.max(...entries.map(([_, v]) => v));
        const chartWidth = canvas.width - padding.left - padding.right;

        // Dibujar barras
        entries.forEach(([categoria, monto], index) => {
            const y = padding.top + index * (barHeight + barGap);
            const barWidth = Math.max((monto / maxValue) * chartWidth, 5);
            const color = this.colors[index % this.colors.length];

            // Barra
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(padding.left, y, barWidth, barHeight, 4);
            ctx.fill();

            // Etiqueta de categoría
            ctx.fillStyle = this.getTextColor();
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(categoria, padding.left - 10, y + barHeight / 2 + 4);

            // Monto
            ctx.fillStyle = this.getTextColor();
            ctx.textAlign = 'left';
            ctx.fillText(this.formatMoney(monto), padding.left + barWidth + 10, y + barHeight / 2 + 4);
        });

        // Leyenda de total
        const total = entries.reduce((sum, [_, v]) => sum + v, 0);
        ctx.fillStyle = this.getSecondaryColor();
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`Total: ${this.formatMoney(total)}`, canvas.width - padding.right + 80, canvas.height - 5);
    },

    /**
     * Dibuja un gráfico de líneas para evolución del balance
     */
    drawEvolucionBalance(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        canvas.width = canvas.offsetWidth;
        canvas.height = 250;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (data.length === 0) {
            ctx.fillStyle = this.getSecondaryColor();
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No hay datos para mostrar', canvas.width / 2, canvas.height / 2);
            return;
        }

        const padding = { top: 30, right: 20, bottom: 50, left: 70 };
        const chartWidth = canvas.width - padding.left - padding.right;
        const chartHeight = canvas.height - padding.top - padding.bottom;

        // Calcular rangos
        const allValues = data.flatMap(d => [d.ingresos, d.gastos, d.balance]);
        const maxValue = Math.max(...allValues, 0);
        const minValue = Math.min(...allValues, 0);
        const range = maxValue - minValue || 1;

        const getY = (value) => {
            return padding.top + chartHeight - ((value - minValue) / range) * chartHeight;
        };

        const getX = (index) => {
            return padding.left + (index / (data.length - 1 || 1)) * chartWidth;
        };

        // Línea base (cero)
        const zeroY = getY(0);
        ctx.strokeStyle = this.getSecondaryColor();
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding.left, zeroY);
        ctx.lineTo(canvas.width - padding.right, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dibujar líneas
        const drawLine = (getValue, color, label) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();

            data.forEach((d, i) => {
                const x = getX(i);
                const y = getY(getValue(d));
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });

            ctx.stroke();

            // Puntos
            data.forEach((d, i) => {
                const x = getX(i);
                const y = getY(getValue(d));
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        drawLine(d => d.ingresos, '#4ecca3', 'Ingresos');
        drawLine(d => d.gastos, '#e94560', 'Gastos');
        drawLine(d => d.balance, '#45b7d1', 'Balance');

        // Etiquetas de meses
        ctx.fillStyle = this.getSecondaryColor();
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';

        data.forEach((d, i) => {
            const x = getX(i);
            const label = d.mes.substring(5) + '/' + d.mes.substring(2, 4);
            ctx.fillText(label, x, canvas.height - 10);
        });

        // Leyenda
        const legends = [
            { label: 'Ingresos', color: '#4ecca3' },
            { label: 'Gastos', color: '#e94560' },
            { label: 'Balance', color: '#45b7d1' }
        ];

        let legendX = padding.left;
        ctx.font = '11px sans-serif';

        legends.forEach(leg => {
            ctx.fillStyle = leg.color;
            ctx.fillRect(legendX, 8, 12, 12);
            ctx.fillStyle = this.getTextColor();
            ctx.textAlign = 'left';
            ctx.fillText(leg.label, legendX + 16, 18);
            legendX += 80;
        });
    },

    /**
     * Formatea un número como moneda ARS
     */
    formatMoney(amount) {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
};
