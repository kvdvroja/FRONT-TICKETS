export interface FilterParameters {
    searchTerm: string;
    selectedOrganizacion: string;
    selectedCategoria: string;
    selectedPrioridad: string;
    selectedEstado: string;
    selectedFechaInicio: Date | null;
    rolsCodi: string;
    cateCodi: string;
    pidm: string;
    aplicarFiltroPidm: string;
    unidCodi: string;
    page: number;
    pageSize: number;
  }