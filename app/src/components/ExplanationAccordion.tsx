type Props = {
  description: string
  explanation: string[]
  loading: boolean
}

export const ExplanationAccordion = ({ description, explanation, loading }: Props) => {
  return (
    <aside className="result-info" aria-label="Opis i kroki rozwiązania">
      <section className="panel text-panel">
        <div className="section-bar">Opis</div>
        {loading && <p className="muted">Przygotowuję prosty opis...</p>}
        {!loading && <p>{description || 'Po wyszukaniu rozwiązania pojawi się tutaj krótki opis.'}</p>}
      </section>

      <section className="panel text-panel">
        <div className="section-bar">Kroki rozwiązania</div>
        {loading && <p className="muted">Rozpisuję kroki prostym językiem...</p>}
        {!loading && explanation.length === 0 && (
          <p className="muted">Tutaj pojawią się dokładne kroki napisane jak dla osoby początkującej.</p>
        )}
        {explanation.length > 0 && (
          <ol className="explanation-list">
            {explanation.map((item, index) => (
              <li key={`${index}-${item}`}>{item}</li>
            ))}
          </ol>
        )}
      </section>
    </aside>
  )
}
