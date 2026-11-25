# MINING_TOOL

**IUrban Material Mining Map | EU-MAT Project**

## Overview

MINING_TOOL is a web-based GIS application developed within **EU-MAT – Effective Urban Material Mining in Cities**, an international project funded by the **Interreg Aurora**.

The project is led by **Karelia University of Applied Sciences** in collaboration with **Aalto University**, **RISE Research Institutes of Sweden**, and **UiT The Arctic University of Norway**. The project develops methods for identifying and assessing urban construction material stocks and their potential for circular use in northern cities. The pilot cities include Joensuu (Finland), Skellefteå (Sweden), and Sortland (Norway).

MINING_TOOL provides an interactive visualization of estimated material stocks in the existing building stock. The current implementation focuses on **wood and concrete in Joensuu, Finland**.

## Features

The current prototype includes:

- Interactive building-level material stock visualization
- Selection between wood and concrete
- Proportional circle symbols based on estimated material quantities (tonnes)
- Material-specific display thresholds and dynamic legends
- Interactive building information popups

## Technical Architecture

The application uses the following geospatial workflow:

**R (spatial analysis) → PostgreSQL/PostGIS → GeoServer → MapLibre GL JS**

- **R:** Building-level material stock estimation and spatial analysis
- **PostGIS:** Storage and management of geospatial data
- **GeoServer:** Publication of spatial data through WMTS vector tiles (MVT)
- **MapLibre GL JS:** Interactive browser-based map visualization
- **HTML, CSS and JavaScript:** Frontend implementation

The R-based analytical workflow is maintained separately in the [MINING_METHOD](https://github.com/venlaheiskanen/mining_method) repository. MINING_TOOL visualizes its outputs through PostGIS and GeoServer.

## Local Development

The application currently runs in a local development environment using Docker-based PostGIS and GeoServer services.

## Data and Limitations

Building information is derived from Finland's open RYHTI building stock data.

Material quantities are estimated using preliminary material intensity (MI) coefficients. The current assumptions have not been validated across all building types and will be refined as the EU-MAT methodology develops.

The results describe **estimated material stocks**, not confirmed recoverable materials or actual demolition waste flows.

## Development Roadmap

Planned development includes:

- Improved building information popups
- Visualization of spatial wood and concrete material clusters
- Refined PostGIS views and GeoServer publishing configurations
- Deployment and testing in a server environment

## License

MIT License. Copyright © Karelia University of Applied Sciences.

See [LICENSE](LICENSE) for details.