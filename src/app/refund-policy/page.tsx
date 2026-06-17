import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';

export default function RefundPolicyPage() {
  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Legal"
        title="Политика возврата"
        description="Каждый запрос на возврат рассматривается индивидуально в соответствии с правилами магазина и действующим законодательством."
      />

      <div className="container mx-auto grid gap-4 px-4 pb-10">
        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">Когда возврат возможен</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Платёж прошёл, но товар не был доставлен в разумный срок.</p>
            <p>- Оплата списана ошибочно (дубликат платежа).</p>
            <p>- Подтверждена техническая ошибка сервиса при выдаче товара.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">Когда возврат может быть отклонён</SectionCardTitle>
            <SectionCardDescription>Наиболее частые основания</SectionCardDescription>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Товар уже успешно выдан и использован.</p>
            <p>- Пользователь указал неверные данные аккаунта при оформлении заказа.</p>
            <p>- Нарушены правила магазина или выявлены признаки злоупотребления.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">Как оформить запрос</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>1. Напишите в поддержку через раздел «Контакты».</p>
            <p>2. Укажите номер заказа и email аккаунта.</p>
            <p>3. Опишите проблему и приложите подтверждающие скриншоты.</p>
          </SectionCardContent>
        </SectionCard>
      </div>

      <SectionCard className="mt-6 border-brand/30 bg-brand-solid/10">
        <SectionCardHeader>
          <SectionCardTitle className="text-brand-secondary">Срок обработки</SectionCardTitle>
          <SectionCardDescription className="text-brand-secondary">
            Обычно мы рассматриваем запросы на возврат в течение 1-3 рабочих дней.
          </SectionCardDescription>
        </SectionCardHeader>
      </SectionCard>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/contacts" color="primary">Связаться с поддержкой</Button>
        <Button href="/rules" color="secondary">Правила магазина</Button>
      </div>
    </section>
  );
}
