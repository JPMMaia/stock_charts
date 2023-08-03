export interface Dataset {
    label: string;
    data: number[] | [number, number][];
    fill?: string;
}

export interface Chart_data {
    labels: string[];
    datasets: Dataset[];
}
