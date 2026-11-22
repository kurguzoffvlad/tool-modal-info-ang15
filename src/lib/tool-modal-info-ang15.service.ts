import { Injectable, Type } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';

import { IModalInfoDialogState, ModalInfoResult } from './tool-modal-info-ang15.interfaces';
import { magenta } from 'tool-log';

/**
 * Сервис для открытия произвольных компонентов в оверлее.
 */
@Injectable({ providedIn: 'root' })
export class ToolModalInfoAng15Service {

	/**
	 * Поток состояний диалога.
	 * `ReplaySubject(1)` — хост получит последнее состояние даже при поздней подписке.
	 */
	private readonly _dialog$ = new ReplaySubject<IModalInfoDialogState | null>(1);

	/**
	 * Текущее активное состояние диалога (для вызова `resolve` при закрытии).
	 * `null`, если диалог не открыт.
	 */
	private _currentState: IModalInfoDialogState | null = null;

	public readonly dialog$: Observable<IModalInfoDialogState | null> = this._dialog$.asObservable();

	/**
	 * Открывает переданный компонент в оверлее и возвращает промис,
	 * который разрешится результатом, переданным в `close()`.
	 * @param component Класс компонента для отображения.
	 * @param data Входные данные, пробрасываемые компоненту через `setInput`.
	 * @returns Промис с результатом закрытия диалога.
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
	 * Закрывает текущий диалог, разрешая ожидающий промис переданным результатом,
	 * и отправляет в поток сигнал `null` для очистки оверлея хостом.
	 * @param result Результат закрытия (по умолчанию `null`).
	 */
	public close(result: ModalInfoResult = null): void {
		this._currentState?.resolve(result);
		this._currentState = null;

		magenta('- ToolModalInfoAng15Service CLOSE ', { value: result });

		this._dialog$.next(null); // сигнал хосту очистить
	}
}
