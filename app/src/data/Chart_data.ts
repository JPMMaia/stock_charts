export interface Dataset {
    label: string;
    data: number[] | object[];
}

export interface Chart_data {
    labels: string[];
    datasets: Dataset[];
}
