
declare var __THREE_DEVTOOLS__: {
	dispatchEvent: (event: CustomEvent) => void;
};

interface Window {
	__THREE__: string;
	__THREE__IMPORTS__: Array<{ url: string; revision: string }>;
}
