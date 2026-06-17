import { SectionCard, SectionCardContent, SectionCardDescription, SectionCardHeader, SectionCardTitle } from '@/components/marketing/SectionCard';
import { Button } from '@/components/base/buttons/button';
import { HeaderCentered } from '@/components/marketing/header-section/header-centered';

export default function ContactsPage() {
  return (
    <section>
      <HeaderCentered
        eyebrow="Поддержка OneSec"
        title="Контакты"
        description="Свяжитесь с нами по вопросам оплаты, доставки цифровых товаров и технических ошибок."
      />

      <div className="container mx-auto px-4 pb-10">
        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard className="border-secondary bg-secondary">
            <SectionCardHeader>
              <SectionCardTitle className="text-primary">Поддержка</SectionCardTitle>
              <SectionCardDescription>Ежедневно с 09:00 до 23:00 (МСК)</SectionCardDescription>
            </SectionCardHeader>
            <SectionCardContent className="space-y-2 text-secondary">
              <p>Email: support@onesec.shop</p>
              <p>
                Telegram:{' '}
                <a
                  href="https://t.me/Orion434"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-secondary hover:underline"
                >
                  @Orion434
                </a>
              </p>
            </SectionCardContent>
          </SectionCard>

          <SectionCard className="border-secondary bg-secondary">
            <SectionCardHeader>
              <SectionCardTitle className="text-primary">Реквизиты</SectionCardTitle>
              <SectionCardDescription>Информация для юридических запросов</SectionCardDescription>
            </SectionCardHeader>
            <SectionCardContent className="space-y-2 text-secondary">
              <p>Название: OneSec Digital</p>
              <p>ИНН: 0000000000 (демо)</p>
              <p>ОГРН: 0000000000000 (демо)</p>
            </SectionCardContent>
          </SectionCard>
        </div>

        <SectionCard className="mt-6 border-brand/30 bg-brand-solid/10">
          <SectionCardHeader>
            <SectionCardTitle className="text-brand-secondary">Что указать в запросе</SectionCardTitle>
            <SectionCardDescription className="text-brand-secondary">
              Чем подробнее данные, тем быстрее мы сможем помочь.
            </SectionCardDescription>
          </SectionCardHeader>
          <SectionCardContent className="space-y-2 text-secondary">
            <p>- Номер заказа</p>
            <p>- Email аккаунта</p>
            <p>- Краткое описание проблемы</p>
            <p>- Скриншот ошибки (если есть)</p>
          </SectionCardContent>
        </SectionCard>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/faq" color="primary">
            Открыть FAQ
          </Button>
          <Button href="/rules" color="secondary">
            Правила магазина
          </Button>
        </div>
      </div>
    </section>
  );
}
