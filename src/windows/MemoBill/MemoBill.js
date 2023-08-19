import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import './MemoBill.css';

const types = {
  PR: { name: "Part", color: [102, 179, 255] },
  F: { name: "Full", color: [133, 224, 133] },
  G: { name: "GR", color: [255, 128, 128] },
  D: { name: "Less", color: [255, 128, 128] },
};

export default function MemoBill({ memo_bills }) {
    return (
        <div>
            <h3> Memo Bills </h3>
            <List>
                {memo_bills.map((bill, index) => {
                    const { bill_number, type, amount } = bill;
                    const colorStyle = {
                        color: `rgb(${types[type].color.join(",")})`
                    };
                    return (
                        <div className="wrapper" key={index}>
                            <ListItem>
                                <Grid container spacing={3}>
                                    <Grid item >
                                        <ListItemText>
                                            <b>Bill No:</b> {bill_number}
                                        </ListItemText>
                                    </Grid>
                                    <Grid item >
                                        <ListItemText style={colorStyle}>
                                            <b>Type:</b> {types[type].name}
                                        </ListItemText>
                                    </Grid>
                                    <Grid item >
                                        <ListItemText>
                                            <b>Amount:</b> {amount}
                                        </ListItemText>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            {index !== memo_bills.length - 1 && <Divider />}  {/* Add divider except for the last item */}
                        </div>
                    );
                })}
            </List>
        </div>
    )
}