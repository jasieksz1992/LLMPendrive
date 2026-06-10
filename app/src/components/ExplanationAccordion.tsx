type Props = {
  explanation: string[]
  loading: boolean
}

export const ExplanationAccordion = ({ explanation, loading }: Props) => {
  return (
    <section className="panel explanation-window">
      <details>
        <summary>
          <span>Jak powstało rozwiązanie</span>
          <small>{explanation.length ? `${explanation.length}/30 punktów` : 'zwinięte kroki'}</small>
        </summary>
        {loading && <p className="muted">Analizuję zadanie i przygotowuję kroki...</p>}
        {!loading && explanation.length === 0 && (
          <p className="muted">Po wygenerowaniu kodu zobaczysz tutaj zwięzłe wyjaśnienie krok po kroku.</p>
        )}
        {explanation.length > 0 && (
          <ol className="explanation-list">
            {explanation.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ol>
        )}
      </details>
    </section>
  )
}
