import Chart, { ChartTypeRegistry } from 'chart.js/auto';

export interface Scale_options {
    axis_ID: string;
    type: string;
    position: string;
    min?: number;
    max?: number;
    units?: string;
}

export interface Dataset {
    label: string;
    data: number[] | [number, number][];
    type: keyof ChartTypeRegistry;
    fill?: string;
    y_scale_options?: Scale_options;
}

export interface Chart_data {
    labels: string[];
    datasets: Dataset[];
    x_scale_options: Scale_options;
}
