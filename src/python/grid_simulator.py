"""
PandaPower Grid Simulator for Rust Web Server
Handles electrical grid simulations and power flow calculations
"""

import pandapower as pp
import json
from typing import Dict, List, Any
import traceback


class GridSimulator:
    """Manages electrical grid simulations using pandapower"""
    
    def __init__(self):
        self.net = None
        self.simulation_results = None
    
    def create_simple_network(self) -> Dict[str, Any]:
        """
        Creates a simple test network with:
        - 2 buses at 110kV
        - 1 external grid connection
        - 1 transmission line
        - 1 load
        """
        try:
            self.net = pp.create_empty_network()
            
            # Create buses
            bus1 = pp.create_bus(self.net, vn_kv=110, name="Bus_1")
            bus2 = pp.create_bus(self.net, vn_kv=110, name="Bus_2")
            
            # Create external grid (slack bus)
            pp.create_ext_grid(self.net, bus1, vm_pu=1.0, name="Grid")
            
            # Create transmission line
            pp.create_line(
                self.net,
                bus1,
                bus2,
                length_km=10,
                std_type='15-AL1/2.4-ST1A 10.0',
                name="Line_1-2"
            )
            
            # Create load
            pp.create_load(self.net, bus2, p_mw=10, q_mvar=5, name="Load_1")
            
            return {
                "status": "success",
                "message": "Network created successfully",
                "buses": len(self.net.bus),
                "lines": len(self.net.line),
                "loads": len(self.net.load),
                "generators": len(self.net.gen)
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to create network: {str(e)}",
                "traceback": traceback.format_exc()
            }
    
    def run_power_flow(self) -> Dict[str, Any]:
        """
        Executes power flow calculation and returns results
        """
        if self.net is None:
            return {
                "status": "error",
                "message": "Network not initialized. Call create_simple_network first."
            }
        
        try:
            # Run load flow
            pp.runpp(self.net, algorithm='nr')
            
            self.simulation_results = {
                "status": "converged",
                "total_losses_mw": float(self.net.res_line['pl_mw'].sum()),
                "total_losses_mvar": float(self.net.res_line['ql_mw'].sum()),
                "computation_time_ms": self.net.exec_time * 1000
            }
            
            return self.simulation_results
        except pp.optimal_toolbox.OPFAlgorithmError:
            return {
                "status": "error",
                "message": "Power flow did not converge"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Simulation failed: {str(e)}",
                "traceback": traceback.format_exc()
            }
    
    def get_bus_results(self) -> Dict[str, Any]:
        """Returns voltage and power results for all buses"""
        if self.net is None or not hasattr(self.net, 'res_bus') or self.net.res_bus.empty:
            return {"status": "error", "message": "No simulation results available"}
        
        try:
            buses = []
            for idx, row in self.net.res_bus.iterrows():
                buses.append({
                    "bus_id": int(idx),
                    "bus_name": self.net.bus.loc[idx, 'name'],
                    "vm_pu": float(row['vm_pu']),
                    "va_degree": float(row['va_degree']),
                    "p_mw": float(row['p_mw']),
                    "q_mvar": float(row['q_mvar'])
                })
            
            return {"status": "success", "buses": buses}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_line_results(self) -> Dict[str, Any]:
        """Returns power flow results for all lines"""
        if self.net is None or not hasattr(self.net, 'res_line') or self.net.res_line.empty:
            return {"status": "error", "message": "No simulation results available"}
        
        try:
            lines = []
            for idx, row in self.net.res_line.iterrows():
                lines.append({
                    "line_id": int(idx),
                    "line_name": self.net.line.loc[idx, 'name'],
                    "from_bus": int(self.net.line.loc[idx, 'from_bus']),
                    "to_bus": int(self.net.line.loc[idx, 'to_bus']),
                    "p_from_mw": float(row['p_from_mw']),
                    "p_to_mw": float(row['p_to_mw']),
                    "pl_mw": float(row['pl_mw']),
                    "loading_percent": float(row['loading_percent'])
                })
            
            return {"status": "success", "lines": lines}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_network_summary(self) -> Dict[str, Any]:
        """Returns overall network summary"""
        if self.net is None:
            return {"status": "error", "message": "Network not initialized"}
        
        try:
            return {
                "status": "success",
                "network": {
                    "buses": len(self.net.bus),
                    "lines": len(self.net.line),
                    "loads": len(self.net.load),
                    "generators": len(self.net.gen),
                    "external_grids": len(self.net.ext_grid)
                },
                "simulation": self.simulation_results
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}


# Global simulator instance
simulator = GridSimulator()