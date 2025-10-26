#!/usr/bin/env python3
"""
Simple database loader for pharmacy sales forecasting.
Works with the backend integration from main.py.
"""

import pandas as pd
import numpy as np
import logging
from typing import Dict, Any, Optional, List
import json
import sys
import os

logger = logging.getLogger(__name__)

class PharmaDataLoader:
    def __init__(self, backend_url: str = "http://localhost:5000/api"):
        """
        Initialize the database loader.
        
        Args:
            backend_url: Base URL of your Node.js backend API (should include /api)
        """
        self.backend_url = backend_url.rstrip('/')
        
        # Try to import requests, but don't fail if not available
        try:
            import requests
            self.requests = requests
            self.requests_available = True
        except ImportError:
            logger.warning("requests library not available - some features may not work")
            self.requests = None
            self.requests_available = False
        
    def load_sales_data_from_service(self) -> pd.DataFrame:
        """
        Load sales data from your salesDataService backend endpoint.
        
        Returns:
            pd.DataFrame: Sales data with date column and product columns
        """
        if not self.requests_available:
            logger.error("requests library not available - cannot fetch data from backend")
            return pd.DataFrame()
            
        try:
            logger.info("🔄 Fetching sales data from backend API...")
            
            # Try different possible endpoints
            endpoints_to_try = [
                f"{self.backend_url}/sales/sales-volume",  # Your current endpoint
                f"{self.backend_url}/forecast/data",       # New integrated endpoint
                f"{self.backend_url}/api/sales/data"       # Alternative
            ]
            
            for endpoint in endpoints_to_try:
                try:
                    logger.info(f"   Trying endpoint: {endpoint}")
                    response = self.requests.get(endpoint, timeout=30)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        if data.get('status', False) and data.get('data'):
                            sales_data = data['data']
                            logger.info(f"✅ Successfully fetched data from: {endpoint}")
                            break
                        else:
                            logger.warning(f"   Endpoint returned no data: {data.get('message', 'Unknown error')}")
                    else:
                        logger.warning(f"   HTTP {response.status_code}: {endpoint}")
                        
                except Exception as e:
                    logger.warning(f"   Connection failed for {endpoint}: {e}")
                    continue
            else:
                raise Exception("Failed to fetch data from any backend endpoint")
            
            logger.info(f"✅ Received {len(sales_data)} records from backend")
            
            # Convert to DataFrame
            df = pd.DataFrame(sales_data)
            
            if df.empty:
                raise Exception("Backend returned empty dataset")
            
            # Clean and prepare the data
            df = self._clean_sales_data(df)
            
            logger.info(f"📊 Sales data processed successfully:")
            logger.info(f"   - Shape: {df.shape}")
            logger.info(f"   - Date range: {df['date'].min()} to {df['date'].max()}")
            
            product_cols = [col for col in df.columns if col != 'date']
            logger.info(f"   - Product columns: {product_cols[:5]}{'...' if len(product_cols) > 5 else ''}")
            
            return df
            
        except Exception as e:
            logger.error(f"❌ Error processing sales data: {e}")
            return pd.DataFrame()
    
    def _clean_sales_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate the sales data from your backend API.
        """
        logger.info("🧹 Cleaning sales data from backend...")
        
        # Ensure date column exists and is properly formatted
        if 'date' not in df.columns:
            raise ValueError("Date column missing from backend sales data")
        
        # Convert date column to datetime
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        # Handle empty string column names (like "" in your data)
        new_columns = []
        for i, col in enumerate(df.columns):
            if col.strip() == '':
                new_col = f'UNKNOWN_PRODUCT_{i}'
                logger.info(f"   - Renaming empty column to: {new_col}")
                new_columns.append(new_col)
            else:
                new_columns.append(col)
        df.columns = new_columns
        
        # Get numeric columns (exclude date)
        numeric_columns = []
        for col in df.columns:
            if col != 'date':
                try:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
                    numeric_columns.append(col)
                except:
                    logger.warning(f"   - Dropping non-numeric column: {col}")
                    df = df.drop(columns=[col])
        
        # Fill NaN values with 0 for numerical columns
        df[numeric_columns] = df[numeric_columns].fillna(0)
        
        # Ensure all sales values are non-negative
        for col in numeric_columns:
            negative_count = (df[col] < 0).sum()
            if negative_count > 0:
                logger.info(f"   - Found {negative_count} negative values in {col}, setting to 0")
                df[col] = df[col].clip(lower=0)
        
        # Remove columns with all zeros (no sales activity)
        zero_columns = []
        for col in numeric_columns:
            if df[col].sum() == 0:
                zero_columns.append(col)
        
        if zero_columns:
            logger.info(f"   - Removing {len(zero_columns)} columns with no sales activity")
            df = df.drop(columns=zero_columns)
        
        # Final validation
        remaining_cols = [col for col in df.columns if col != 'date']
        if not remaining_cols:
            raise ValueError("No valid product columns remaining after cleaning")
        
        if len(df) < 10:
            logger.warning(f"   - Warning: Only {len(df)} data points available")
        
        logger.info(f"✅ Data cleaning completed:")
        logger.info(f"   - Final shape: {df.shape}")
        logger.info(f"   - Product columns: {len(remaining_cols)}")
        
        return df
    
    def validate_backend_connection(self) -> Dict[str, Any]:
        """
        Validate connection to backend.
        """
        if not self.requests_available:
            return {
                'connected': False,
                'endpoint': None,
                'status': {},
                'message': 'requests library not available'
            }
            
        try:
            logger.info("🔍 Validating backend connection...")
            
            # Try to get a simple response
            response = self.requests.get(f"{self.backend_url}/sales/sales-volume", timeout=10)
            
            if response.status_code == 200:
                return {
                    'connected': True,
                    'endpoint': f"{self.backend_url}/sales/sales-volume",
                    'status': {'code': response.status_code},
                    'message': 'Connection successful'
                }
            else:
                return {
                    'connected': False,
                    'endpoint': f"{self.backend_url}/sales/sales-volume",
                    'status': {'code': response.status_code},
                    'message': f'HTTP {response.status_code}'
                }
                
        except Exception as e:
            logger.error(f"❌ Backend validation failed: {e}")
            return {
                'connected': False,
                'endpoint': None,
                'status': {},
                'message': f'Validation error: {e}'
            }

# Simple test function
def test_connection(backend_url="http://localhost:5000/api"):
    """Test the database loader"""
    loader = PharmaDataLoader(backend_url)
    
    print("Testing backend connection...")
    validation = loader.validate_backend_connection()
    print(f"Connected: {validation['connected']}")
    print(f"Message: {validation['message']}")
    
    if validation['connected']:
        print("Loading data...")
        df = loader.load_sales_data_from_service()
        if not df.empty:
            print(f"Success! Loaded {len(df)} records with {len(df.columns)-1} product columns")
            return True
    
    return False

if __name__ == "__main__":
    test_connection()