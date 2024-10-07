import { useEffect, useState } from 'react';
import axios from 'axios';

interface SelectComponentProps {
    comp_id: number;
    model_id?: string;
}

interface Option {
    id: number;
    comp_name: string;
    delta_price: number;
}

const SelectComponent: React.FC<SelectComponentProps> = ({ comp_id, model_id }) => {

    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (model_id) {
            (async () => {
                try {
                    const res = await axios.get(`/alternate-components/${model_id}/${comp_id}`);
                    setOptions(res.data.data);
                    setLoading(false);
                } catch (e) {
                    console.log(e);
                }
            })();
        }
    }, [comp_id, model_id]);


    const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        const existingOptionsArray = sessionStorage.getItem(`selectedComp`);
        const existingOptions = existingOptionsArray ? JSON.parse(existingOptionsArray) : [];

        console.log(existingOptions)
        // Check if a similar comp_id exists in the array
        const index = existingOptions.findIndex((item: any) => item.comp_id === comp_id);

        if (index !== -1) {
            // If the comp_id exists, replace its content
            existingOptions[index] = { comp_id, selectedValue };
        } else {
            // If the comp_id doesn't exist, append it
            existingOptions.push({ comp_id, selectedValue });
        }
        // Store the updated array back in sessionStorage
        sessionStorage.setItem(`selectedComp`, JSON.stringify(existingOptions));
    };


    return (<>

        <br /><br />
        <select onChange={handleOptionChange} >
            {loading ?
                <option>Loading...</option>
                : <>
                    <option value={""}>Please select one</option>
                    {options.map((option, index) => (
                        <option key={index} value={model_id + "@" + comp_id + "@" + option.comp_name + "@" + option.delta_price}>
                            {option.comp_name}&nbsp;@&nbsp;{option.delta_price}
                        </option>
                    ))
                    }
                </>
            }
        </select>
        <br /><br />
    </>
    )
}

export default SelectComponent