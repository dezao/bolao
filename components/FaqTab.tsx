import React from 'react';

const FaqItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
  <div className="py-4">
    <dt className="font-semibold text-gray-800 dark:text-gray-200">{question}</dt>
    <dd className="mt-2 text-gray-600 dark:text-gray-400">{children}</dd>
  </div>
);

const FaqTab: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dúvidas Frequentes (FAQ)</h2>
      <p className="mb-6 text-lg font-semibold text-primary-600 dark:text-primary-400">Bolão do Sebastião</p>

      <div className="space-y-6">
        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-primary-500 pb-2 mb-4">
            PARTICIPAÇÃO E VALORES
          </h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <FaqItem question="1. O que é o bolão e como funciona a modalidade mensal?">
              O bolão é um grupo de pessoas que se reúne para fazer apostas coletivas, aumentando as chances de ganhar. Na modalidade mensal, ao adquirir sua cota, você participa de todas as apostas realizadas diariamente durante o mês inteiro com um único pagamento.
            </FaqItem>
            <FaqItem question="2. Qual o valor para participar?">
              Cada cota custa R$ 20,00. Você pode adquirir quantas cotas desejar.
            </FaqItem>
            <FaqItem question="3. Qualquer pessoa pode participar?">
              Sim, desde que seja indicada por um participante atual do grupo.
            </FaqItem>
            <FaqItem question="4. Como confirmo minha participação?">
              <strong>Atenção:</strong> Estar no grupo do WhatsApp NÃO significa que sua participação está confirmada. Sua participação só é garantida após o pagamento e a inclusão de seu nome na lista oficial de controle do bolão.
            </FaqItem>
            <FaqItem question="5. Qual o prazo de participação no bolão do mês?">
              O bolão normalmente inicia no dia 10 e segue até o último dia do mês, ou enquanto houver saldo para novas apostas.
            </FaqItem>
          </dl>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-primary-500 pb-2 mb-4">
            APOSTAS E PREMIAÇÕES
          </h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <FaqItem question="6. Quais são as modalidades de apostas?">
                Realizamos três tipos de apostas:
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Loterias Nacionais: Através do site oficial da Caixa</li>
                    <li>Loterias Internacionais: Através do site The Lotter</li>
                    <li>Cartelas da HiperSaúde: Através do site oficial</li>
                </ul>
            </FaqItem>
            <FaqItem question="7. Como são escolhidas as loterias?">
              A escolha é baseada nos maiores prêmios acumulados disponíveis no dia, priorizando sempre as melhores oportunidades de retorno para o grupo.
            </FaqItem>
            <FaqItem question="8. Como são feitas as apostas?">
              Todas as apostas são realizadas automaticamente pelos sistemas oficiais de cada loteria.
            </FaqItem>
            <FaqItem question="9. Como funciona a divisão dos prêmios?">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Prêmios acima de R$ 2.000,00:</strong> Divididos igualmente entre todas as cotas</li>
                <li><strong>Prêmios entre R$ 50,00 e R$ 2.000,00:</strong> Enquete no grupo para decidir entre dividir, sortear ou reinvestir</li>
                <li><strong>Prêmios abaixo de R$ 50,00:</strong> Automaticamente acumulados e reinvestidos em novas apostas</li>
              </ul>
            </FaqItem>
            <FaqItem question="10. Quando e como recebo meu prêmio?">
              O prêmio é creditado na conta do organizador e a divisão é feita proporcionalmente às cotas. O repasse é realizado em até 5 dias úteis após confirmação pela loteria, via PIX ou transferência.
            </FaqItem>
          </dl>
        </section>

        <section>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 border-b-2 border-primary-500 pb-2 mb-4">
            REGRAS E TRANSPARÊNCIA
          </h3>
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <FaqItem question="11. Posso sair no meio do mês e receber reembolso?">
              Não. Uma vez confirmada a participação e realizadas as apostas, o valor da cota não é reembolsável, pois já foi integralmente investido.
            </FaqItem>
            <FaqItem question="12. O organizador recebe comissão?">
              Não. O organizador atua de forma voluntária e também paga por suas cotas. 100% do valor arrecadado é revertido em apostas.
            </FaqItem>
            <FaqItem question="13. Como posso conferir as apostas e resultados?">
              Todas as apostas são publicadas antecipadamente no grupo. Após cada sorteio, os resultados são informados e publicados no site oficial:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Site do Bolão:</strong> <a href="https://bolaodosebastiao.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">https://bolaodosebastiao.vercel.app/</a></li>
                <li><strong>Loterias Caixa:</strong> <a href="https://www.loteriasonline.caixa.gov.br/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">https://www.loteriasonline.caixa.gov.br/</a></li>
                <li><strong>The Lotter:</strong> <a href="https://www.thelotter.com/pt/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">https://www.thelotter.com/pt/</a></li>
                <li><strong>HiperSaúde:</strong> <a href="https://hipersaudebauru.com.br/" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">https://hipersaudebauru.com.br/</a></li>
              </ul>
            </FaqItem>
             <FaqItem question="14. Por que criam um novo grupo todo mês?">
                Para garantir que apenas os participantes do mês atual tenham acesso às informações, mantendo a organização e a lista sempre atualizada.
            </FaqItem>
             <FaqItem question="15. Por que o grupo é bloqueado para mensagens?">
                O grupo é restrito para postagens apenas do administrador (Ricardo - 18 99766-7174) para:
                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Evitar confusão e perda de informações importantes</li>
                    <li>Manter o foco em apostas, resultados e comunicados essenciais</li>
                    <li>Garantir que todos tenham acesso às mesmas informações de forma organizada</li>
                </ul>
            </FaqItem>
          </dl>
        </section>

        <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">✱ Transparência e Isenção</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Este bolão não possui interesse comercial. Todo o valor arrecadado com as cotas é integralmente convertido em apostas. O organizador também participa como cotista, pagando por suas próprias cotas.
            </p>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Todas as informações — lista de participantes, número de cotas, valores arrecadados, gastos com apostas e premiações — são divulgadas periodicamente no grupo do WhatsApp e no site oficial, assegurando total transparência para todos os envolvidos.
            </p>
        </section>
      </div>
    </div>
  );
};

export default FaqTab;