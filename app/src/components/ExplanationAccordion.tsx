type Props = {
  explanation: string[]
  loading: boolean
}

export const ExplanationAccordion = ({ explanation, loading }: Props) => {
  return (
    <aside className="result-info" aria-label="Kroki rozwiązania">
      <section className="panel text-panel steps-panel">
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
