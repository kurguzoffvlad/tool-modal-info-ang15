import { Injectable, Type } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

import { IModalInfoDialogState, ModalInfoResult } from './tool-modal-info-ang15.interfaces';
import { magenta } from 'tool-log';

/**
 * Сервис для открытия произвольных компонентов в оверлее.
 */
@Injectable({ providedIn: 'root' })
export class ToolModalInfoAng15Service {
	// ReplaySubject(1) — хост получит последнее состояние даже при поздней подписке
	private readonly _dialog$ = new ReplaySubject<IModalInfoDialogState | null>(1);
	private _currentState: IModalInfoDialogState | null = null;

	public readonly dialog$: Observable<IModalInfoDialogState | null> = this._dialog$.asObservable();

	/**
	 * Открыть компонент и дождаться результата.
	 * @param component Класс компонента
	 * @param data Входные данные (пробрасываются через setInput)
	 */
	public open<T = ModalInfoResult>(
		component: Type<unknown>,
		data?: Record<string, unknown>,
	): Promise<T> {
		return new Promise<T>((resolve) => {
			const state: IModalInfoDialogState = {
				component,
				resolve: resolve as (result: ModalInfoResult) => void,
				data,
			};

			this._currentState = state;

			magenta('- ToolModalInfoAng15Service OPEN ', { component: component.name }, data);

			this._dialog$.next(state);
		});
	}

	/**
	 * Закрыть текущий компонент с результатом.
	 * @param result Результат
	 */
	public close(result: ModalInfoResult = null): void {
		this._currentState?.resolve(result);
		this._currentState = null;

		magenta('- ToolModalInfoAng15Service CLOSE ', { value: result });

		this._dialog$.next(null); // сигнал хосту очистить
	}
}
