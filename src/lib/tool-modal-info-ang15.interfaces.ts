import { Type } from '@angular/core';

/** Результат, который компонент возвращает наружу */
export type ModalInfoResult = unknown;

/** Внутреннее состояние открытого компонента */
export interface IModalInfoDialogState {
	/** Класс компонента */
	readonly component: Type<unknown>;
	/** Колбэк закрытия */
	readonly resolve: (result: ModalInfoResult) => void;
	/** Данные */
	readonly data?: Record<string, unknown>;
}
