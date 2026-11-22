# Tool Modal Info Angular 15 (`tool-modal-info-ang15`)

## Использование

Универсальная Angular-библиотека для открытия произвольных компонентов в модальном оверлее с передачей входных данных и возвратом результата через `Promise`.

Библиотека состоит из двух ключевых частей:

- **`ToolModalInfoAng15Service`** — сервис для открытия и закрытия модальных окон;
- **`ToolModalInfoHostAng15Component`** — хост-компонент, отображающий оверлей (размещается один раз в корне приложения).

---

## Содержание

- [Установка](#установка)
- [Подключение модуля](#подключение-модуля)
- [Размещение хост-компонента](#размещение-хост-компонента)
- [Создание компонента-диалога](#создание-компонента-диалога)
- [Открытие диалога](#открытие-диалога)
- [Закрытие диалога и возврат результата](#закрытие-диалога-и-возврат-результата)
- [API](#api)
- [Структура](#структура)

---

## Установка

```bash
npm install tool-modal-info-ang15
```

Peer-зависимости (Angular 15):

```json
{
  "@angular/common": "^15.2.0",
  "@angular/core": "^15.2.0"
}
```

---

## Подключение модуля

Импортируйте `ToolModalInfoAng15Module` в модуль приложения:

```ts
import { ToolModalInfoAng15Module } from 'tool-modal-info-ang15';

@NgModule({
  imports: [ ToolModalInfoAng15Module ],
  // ...
})
export class AppModule { }
```

---

## Размещение хост-компонента

Разместите хост-компонент **один раз** в корне приложения (например, в `app.component.html`):

```html
<tool-modal-info-host-ang15></tool-modal-info-host-ang15>
```

Хост-компонент отвечает за отображение оверлея с затемнённым фоном и динамическую отрисовку переданного компонента.

---

## Создание компонента-диалога

Создайте обычный Angular-компонент с входными параметрами через `@Input()` и методом для закрытия диалога:

```ts
import { Component, inject } from '@angular/core';
import { ToolModalInfoAng15Service } from 'tool-modal-info-ang15';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2>{{ title }}</h2>
    <p>{{ message }}</p>
    <button (click)="confirm(true)">OK</button>
    <button (click)="confirm(false)">Отмена</button>
  `
})
export class ConfirmDialogComponent {
  @Input() title: string = '';
  @Input() message: string = '';

  private readonly modal = inject(ToolModalInfoAng15Service);

  confirm(value: boolean): void {
    this.modal.close(value);
  }
}
```

---

## Открытие диалога

Используйте сервис `ToolModalInfoAng15Service` для открытия компонента в оверлее:

```ts
import { Component, inject } from '@angular/core';
import { ToolModalInfoAng15Service } from 'tool-modal-info-ang15';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-main',
  template: `<button (click)="showConfirm()">Проверить</button>`
})
export class MainComponent {
  private readonly modal = inject(ToolModalInfoAng15Service);

  async showConfirm(): Promise<void> {
    const result = await this.modal.open<boolean>(ConfirmDialogComponent, {
      title: 'Подтверждение',
      message: 'Вы уверены?'
    });

    console.log('Результат:', result); // true или false
  }
}
```

Метод `open()` возвращает `Promise`, который разрешается при вызове `close()` в компоненте-диалоге.

---

## Закрытие диалога и возврат результата

Вызовите `close(result)` для закрытия диалога и передачи результата:

```ts
this.modal.close(true);   // разрешить Promise со значением true
this.modal.close('data'); // разрешить Promise со строкой
this.modal.close();       // разрешить Promise со значением null
```

---

## API

### `ToolModalInfoAng15Service`

| Метод | Описание |
|-------|----------|
| `open<T>(component, data?)` | Открывает компонент в оверлее. Возвращает `Promise<T>`. |
| `close(result?)` | Закрывает текущий диалог и разрешает Promise с `result`. |

**Параметры `open`:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `component` | `Type<unknown>` | Класс компонента для отображения |
| `data` | `Record<string, unknown>` | Входные данные, пробрасываются через `setInput()` |

### `IModalInfoDialogState`

```ts
interface IModalInfoDialogState {
  readonly component: Type<unknown>;   // Класс компонента
  readonly resolve: (result: ModalInfoResult) => void; // Колбэк разрешения Promise
  readonly data?: Record<string, unknown>;             // Входные данные
}
```

### `ModalInfoResult`

```ts
type ModalInfoResult = unknown;
```

Тип результата, возвращаемого из диалога.

---

## Структура

```
tool-modal-info-ang15/
├── src/
│   ├── lib/
│   │   ├── tool-modal-info-ang15.module.ts          # Angular-модуль
│   │   ├── tool-modal-info-ang15.service.ts         # Сервис (open/close)
│   │   ├── tool-modal-info-ang15.interfaces.ts      # Интерфейсы
│   │   └── tool-modal-info-host-ang15.component.ts  # Хост-компонент оверлея
│   └── public-api.ts                                # Публичный экспорт
├── package.json
└── ng-package.json
```

---

## Примечания

- Данные передаются в компонент через `ComponentRef.setInput()` — все ключи `data` становятся `@Input()` свойствами.
- Оверлей имеет `z-index: 10000` и затемнённый фон `rgba(0, 0, 0, 0.5)`.
- Состояние диалога управляется через `ReplaySubject(1)`, что гарантирует получение последнего состояния при поздней подписке.
- Хост-компонент автоматически уничтожает динамический компонент при закрытии диалога.
