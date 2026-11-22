import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	ComponentRef,
	OnDestroy,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { ToolModalInfoAng15Service } from './tool-modal-info-ang15.service';
import { IModalInfoDialogState } from './tool-modal-info-ang15.interfaces';

/**
 * Хост-компонент, отображающий активный компонент в оверлее.
 * Размещается один раз в корне приложения.
 */
@Component({
	selector: 'tool-modal-info-host-ang15',
	template: `
		<div
			class="user-info-host__backdrop"
			[class.user-info-host__backdrop--hidden]="!current"
		>
			<ng-container #contentHost></ng-container>
		</div>
	`,
	styles: [ `
		.user-info-host__backdrop {
			position: fixed;
			inset: 0;
			background: rgba(0, 0, 0, 0.5);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000;
		}

		.user-info-host__backdrop--hidden {
			display: none;
		}
	` ],
})
export class ToolModalInfoHostAng15Component implements AfterViewInit, OnDestroy {
	/**
	 * Текущее состояние диалога: активный компонент, его данные и резолвер.
	 * `null` — оверлей закрыт.
	 */
	public current: IModalInfoDialogState | null = null;

	/**
	 * Контейнер (`ViewContainerRef`), в который динамически создаётся
	 * компонент активного диалога.
	 */
	@ViewChild('contentHost', { read: ViewContainerRef })
	private _contentHost!: ViewContainerRef;

	/**
	 * Поток для отписки от подписок при уничтожении компонента.
	 */
	private readonly _destroy$ = new Subject<void>();

	/**
	 * Ссылка на созданный динамический компонент диалога.
	 * `null`, если в данный момент ничего не отображено.
	 */
	private _contentRef: ComponentRef<unknown> | null = null;

	/**
	 * @param _userInfo Сервис управления диалогами (источник состояний).
	 * @param _cdr Ссылка на `ChangeDetectorRef` для ручного запуска
	 * обнаружения изменений после динамического создания/удаления компонента.
	 */
	public constructor(
		private readonly _userInfo: ToolModalInfoAng15Service,
		private readonly _cdr: ChangeDetectorRef,
	) {
	}

	/**
	 * Подписывается на поток состояний диалога.
	 * При появлении состояния — рендерит компонент, при `null` — уничтожает его.
	 */
	public ngAfterViewInit(): void {
		this._userInfo.dialog$
			.pipe(takeUntil(this._destroy$))
			.subscribe((state) => {
				this.current = state;

				if (state) {
					this._render(state);
				} else {
					this._contentRef?.destroy();
					this._contentRef = null;
					this._cdr.detectChanges();
				}
			});
	}

	public ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();

		this._contentRef?.destroy();
		this._contentRef = null;
	}

	/**
	 * Создаёт компонент диалога в контейнере и пробрасывает ему входные данные
	 * через `setInput`, после чего запускает обнаружение изменений.
	 * Предварительно уничтожает ранее созданный компонент, если он есть.
	 * @param state Состояние диалога (класс компонента + данные).
	 */
	private _render(state: IModalInfoDialogState): void {
		if (!this._contentHost) {
			return;
		}

		this._contentRef?.destroy();
		this._contentRef = this._contentHost.createComponent(state.component);

		const data = state.data;

		if (data) {
			for (const [ key, value ] of Object.entries(data)) {
				this._contentRef.setInput(key, value);
			}
		}

		this._cdr.detectChanges();
	}
}
