const BiasVisualizer = ({ biasScale }) => {
  if (!biasScale) return null;

  return (
    <div className="bias-visualizer">
      <div className="bias-label">Bias Distribution</div>
      <div className="bias-bar-container">
        {biasScale.left > 0 && (
          <div
            className="bias-segment left"
            style={{ width: `${biasScale.left}%` }}
            title={`Left: ${biasScale.left}%`}
          />
        )}
        {biasScale.center > 0 && (
          <div
            className="bias-segment center"
            style={{ width: `${biasScale.center}%` }}
            title={`Center: ${biasScale.center}%`}
          />
        )}
        {biasScale.unbiased > 0 && (
          <div
            className="bias-segment unbiased"
            style={{ width: `${biasScale.unbiased}%` }}
            title={`Unbiased: ${biasScale.unbiased}%`}
          />
        )}
        {biasScale.right > 0 && (
          <div
            className="bias-segment right"
            style={{ width: `${biasScale.right}%` }}
            title={`Right: ${biasScale.right}%`}
          />
        )}
        {biasScale.unknown > 0 && (
          <div
            className="bias-segment unknown"
            style={{ width: `${biasScale.unknown}%` }}
            title={`Unknown: ${biasScale.unknown}%`}
          />
        )}
      </div>
    </div>
  );
};

export default BiasVisualizer;
