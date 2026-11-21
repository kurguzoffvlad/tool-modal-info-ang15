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
	selector: 'tool-modal-info-host',
	template: `
        <div
            class="user-info-host__backdrop"
            [class.user-info-host__backdrop--hidden]="!current"
        >
            <ng-container #contentHost></ng-container>
        </div>
    `,
	styles: [`
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
    `],
})
export class ToolModalInfoHostComponent implements AfterViewInit, OnDestroy {
	/** Текущий запрос на открытие */
	public current: IModalInfoDialogState | null = null;

	/** Контейнер для динамического компонента */
	@ViewChild('contentHost', { read: ViewContainerRef })
	private _contentHost!: ViewContainerRef;

	private readonly _destroy$ = new Subject<void>();
	private _contentRef: ComponentRef<unknown> | null = null;

	public constructor(
		private readonly _userInfo: ToolModalInfoAng15Service,
		private readonly _cdr: ChangeDetectorRef,
	) {}

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
	 * Создаёт компонент и передаёт ему входные данные.
	 * @param state Состояние
	 */
	private _render(state: IModalInfoDialogState): void {
		if (!this._contentHost) {
			return;
		}

		this._contentRef?.destroy();
		this._contentRef = this._contentHost.createComponent(state.component);

		const data = state.data;

		if (data) {
			for (const [key, value] of Object.entries(data)) {
				this._contentRef.setInput(key, value);
			}
		}

		this._cdr.detectChanges();
	}
}
