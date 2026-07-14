import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';

export default function RulesPage() {
  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Legal"
        title="Правила магазина"
        description="Актуальные правила оформления, оплаты и исполнения заказов в сервисе OneSec."
      />

      <div className="container mx-auto grid gap-4 px-4 pb-10">
        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">1. Оформление заказа</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Покупатель обязан указывать корректный email и данные аккаунта.</p>
            <p>- Неверно указанные данные могут привести к задержке доставки заказа.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">2. Оплата и доставка</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Заказ передается в обработку сразу после подтверждения оплаты.</p>
            <p>- Среднее время доставки цифровых товаров: 1-5 минут.</p>
            <p>- В отдельных случаях возможна ручная проверка платежа.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">3. Возвраты и споры</SectionCardTitle>
            <SectionCardDescription>Подробные условия описаны на отдельной странице</SectionCardDescription>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Возвраты рассматриваются индивидуально по каждому обращению.</p>
            <p>- Для разбора спора укажите номер заказа и приложите скриншоты.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">4. Безопасность аккаунта</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Не передавайте третьим лицам данные для входа в ваш профиль.</p>
            <p>- Используйте сложный пароль и периодически обновляйте его.</p>
          </SectionCardContent>
        </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/user-agreement" color="primary">Пользовательское соглашение</Button>
        <Button href="/refund-policy" color="secondary">Политика возврата</Button>
      </div>
    </section>
  );
}
