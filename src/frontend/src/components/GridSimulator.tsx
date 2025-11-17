import React, { useState } from 'react';
import './GridSimulator.css';

interface Bus {
    bus_id: number;
    bus_name: string;
    vm_pu: number;
    va_degree: number;
    p_mw: number;
    q_mvar: number;
}

interface Line {
    line_id: number;
    line_name: string;
    from_bus: number;
    to_bus: number;
    p_from_mw: number;
    p_to_mw: number;
    pl_mw: number;
    loading_percent: number;
}

interface SimulationResult {
    status: string;
    message?: string;
    buses?: Bus[];
    lines?: Line[];
    total_losses_mw?: number;
    total_losses_mvar?: number;
    computation_time_ms?: number;
    network?: {
        buses: number;
        lines: number;
        loads: number;
        generators: number;
        external_grids: number;
    };
    simulation?: {
        status: string;
        total_losses_mw: number;
        total_losses_mvar: number;
        computation_time_ms: number;
    };
    error?: string;
}

export const GridSimulator: React.FC = () => {
    const [result, setResult] = useState<SimulationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'buses' | 'lines'>('overview');

    const createNetwork = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/grid/create', { method: 'POST' });
            const data = await response.json();
            setResult(data);
            setActiveTab('overview');
        } catch (error) {
            setResult({ status: 'error', error: String(error) });
        } finally {
            setLoading(false);
        }
    };

    const runSimulation = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/grid/simulate', { method: 'POST' });
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ status: 'error', error: String(error) });
        } finally {
            setLoading(false);
        }
    };

    const getBusResults = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/grid/buses');
            const data = await response.json();
            setResult(data);
            setActiveTab('buses');
        } catch (error) {
            setResult({ status: 'error', error: String(error) });
        } finally {
            setLoading(false);
        }
    };

    const getLineResults = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/grid/lines');
            const data = await response.json();
            setResult(data);
            setActiveTab('lines');
        } catch (error) {
            setResult({ status: 'error', error: String(error) });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid-simulator">
            <h2>📊 PandaPower Grid Simulator</h2>
            
            <div className="controls">
                <button onClick={createNetwork} disabled={loading}>
                    {loading ? 'Loading...' : '⚡ Create Network'}
                </button>
                <button onClick={runSimulation} disabled={loading}>
                    {loading ? 'Running...' : '▶ Run Simulation'}
                </button>
                <button onClick={getBusResults} disabled={loading}>
                    {loading ? 'Loading...' : '🔌 Bus Results'}
                </button>
                <button onClick={getLineResults} disabled={loading}>
                    {loading ? 'Loading...' : '📈 Line Results'}
                </button>
            </div>

            {result && (
                <div className="results">
                    {result.error ? (
                        <div className="error">
                            <h3>❌ Error</h3>
                            <p>{result.error}</p>
                        </div>
                    ) : (
                        <>
                            <div className="tabs">
                                <button
                                    className={activeTab === 'overview' ? 'active' : ''}
                                    onClick={() => setActiveTab('overview')}
                                >
                                    Overview
                                </button>
                                <button
                                    className={activeTab === 'buses' ? 'active' : ''}
                                    onClick={() => setActiveTab('buses')}
                                >
                                    Buses
                                </button>
                                <button
                                    className={activeTab === 'lines' ? 'active' : ''}
                                    onClick={() => setActiveTab('lines')}
                                >
                                    Lines
                                </button>
                            </div>

                            {activeTab === 'overview' && (
                                <div className="tab-content">
                                    {result.message && <p>{result.message}</p>}
                                    {result.status && <p><strong>Status:</strong> {result.status}</p>}
                                    
                                    {result.network && (
                                        <div className="network-info">
                                            <h4>Network Configuration</h4>
                                            <ul>
                                                <li>Buses: {result.network.buses}</li>
                                                <li>Lines: {result.network.lines}</li>
                                                <li>Loads: {result.network.loads}</li>
                                                <li>Generators: {result.network.generators}</li>
                                                <li>External Grids: {result.network.external_grids}</li>
                                            </ul>
                                        </div>
                                    )}

                                    {result.simulation && (
                                        <div className="simulation-results">
                                            <h4>Simulation Results</h4>
                                            <ul>
                                                <li><strong>Total Losses:</strong> {result.simulation.total_losses_mw.toFixed(4)} MW</li>
                                                <li><strong>Reactive Losses:</strong> {result.simulation.total_losses_mvar.toFixed(4)} MVar</li>
                                                <li><strong>Computation Time:</strong> {result.simulation.computation_time_ms.toFixed(2)} ms</li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'buses' && result.buses && (
                                <div className="tab-content">
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                <th>Bus ID</th>
                                                <th>Bus Name</th>
                                                <th>Voltage (p.u.)</th>
                                                <th>Angle (°)</th>
                                                <th>P (MW)</th>
                                                <th>Q (MVar)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.buses.map((bus) => (
                                                <tr key={bus.bus_id}>
                                                    <td>{bus.bus_id}</td>
                                                    <td>{bus.bus_name}</td>
                                                    <td>{bus.vm_pu.toFixed(4)}</td>
                                                    <td>{bus.va_degree.toFixed(2)}</td>
                                                    <td>{bus.p_mw.toFixed(4)}</td>
                                                    <td>{bus.q_mvar.toFixed(4)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'lines' && result.lines && (
                                <div className="tab-content">
                                    <table className="results-table">
                                        <thead>
                                            <tr>
                                                <th>Line ID</th>
                                                <th>Line Name</th>
                                                <th>From Bus</th>
                                                <th>To Bus</th>
                                                <th>P From (MW)</th>
                                                <th>P To (MW)</th>
                                                <th>Losses (MW)</th>
                                                <th>Loading (%)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.lines.map((line) => (
                                                <tr key={line.line_id}>
                                                    <td>{line.line_id}</td>
                                                    <td>{line.line_name}</td>
                                                    <td>{line.from_bus}</td>
                                                    <td>{line.to_bus}</td>
                                                    <td>{line.p_from_mw.toFixed(4)}</td>
                                                    <td>{line.p_to_mw.toFixed(4)}</td>
                                                    <td>{line.pl_mw.toFixed(4)}</td>
                                                    <td>
                                                        <div className="loading-bar">
                                                            <div
                                                                className={`loading-fill ${
                                                                    line.loading_percent > 80 ? 'warning' : ''
                                                                }`}
                                                                style={{ width: `${Math.min(line.loading_percent, 100)}%` }}
                                                            />
                                                            <span>{line.loading_percent.toFixed(1)}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};