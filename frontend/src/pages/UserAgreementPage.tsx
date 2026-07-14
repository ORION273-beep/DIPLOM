import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';

export default function UserAgreementPage() {
  return (
    <section>
      <HeaderCentered
        eyebrow="OneSec Legal"
        title="Пользовательское соглашение"
        description="Использование сервиса OneSec означает согласие с настоящим соглашением, а также с правилами магазина и политикой возврата."
      />

      <div className="container mx-auto grid gap-4 px-4 pb-10">
        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">1. Общие положения</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- OneSec предоставляет доступ к покупке цифровых товаров и сервисов.</p>
            <p>- Пользователь обязуется использовать сайт только в законных целях.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">2. Регистрация и аккаунт</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Пользователь отвечает за достоверность данных, указанных при регистрации.</p>
            <p>- Запрещена передача аккаунта третьим лицам и попытки обхода защиты сервиса.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">3. Оплата и исполнение заказа</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Заказ исполняется после подтверждения успешной оплаты.</p>
            <p>- Срок доставки зависит от типа товара и технических условий провайдера.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">4. Ограничение ответственности</SectionCardTitle>
            <SectionCardDescription>Важно учитывать при покупке цифровых товаров</SectionCardDescription>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- OneSec не отвечает за ограничения со стороны сторонних игровых платформ.</p>
            <p>- Пользователь самостоятельно проверяет региональные и технические требования.</p>
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="border-secondary bg-secondary">
          <SectionCardHeader>
            <SectionCardTitle className="text-primary">5. Изменение условий</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent className="text-secondary">
            Администрация может обновлять условия соглашения. Актуальная версия всегда доступна на
            этой странице.
          </SectionCardContent>
        </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href="/rules" color="primary">Правила магазина</Button>
        <Button href="/refund-policy" color="secondary">Политика возврата</Button>
      </div>
    </section>
  );
}
